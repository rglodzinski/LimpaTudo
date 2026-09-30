import fs from "node:fs/promises";
import path from "node:path";
import { run } from "./apps/inventory";
import type { StorageVolume } from "./types";

/**
 * Capacity of the mounted storage devices, for the dashboard chart.
 *
 * This only reads each volume's totals with statfs — it never walks a
 * volume's contents, so it stays within the whitelist-only scanning rule of
 * docs/00-visao-geral.md. Network shares and disk images are left out: they
 * aren't devices the user can clean, and statfs on a stale network mount can
 * hang.
 */
export async function listVolumes(): Promise<StorageVolume[]> {
  const candidates = process.platform === "darwin" ? await macCandidates() : await linuxCandidates();
  const volumes: StorageVolume[] = [];
  for (const candidate of candidates) {
    try {
      const stats = await fs.statfs(candidate.mountPoint);
      const totalBytes = stats.blocks * stats.bsize;
      if (totalBytes === 0) continue;
      const freeBytes = stats.bavail * stats.bsize;
      volumes.push({ ...candidate, totalBytes, freeBytes, usedBytes: totalBytes - freeBytes });
    } catch {
      // unmounted in the meantime, or not readable (sandbox)
    }
  }
  return volumes;
}

/**
 * Mount point of the listed volume holding `targetPath`: the longest one that
 * prefixes it ("/Volumes/SSD" over "/"). Null when none does.
 */
export function volumeOf(targetPath: string, mountPoints: string[]): string | null {
  let best: string | null = null;
  for (const mountPoint of mountPoints) {
    const prefix = mountPoint.endsWith("/") ? mountPoint : `${mountPoint}/`;
    if (targetPath !== mountPoint && !targetPath.startsWith(prefix)) continue;
    if (!best || mountPoint.length > best.length) best = mountPoint;
  }
  return best;
}

/** Bytes per volume and category — HistoryEntry.byVolume. */
export async function byVolumeFromItems(
  items: { path: string; category: string; sizeBytes: number }[],
): Promise<Record<string, Record<string, number>>> {
  const mountPoints = (await listVolumes()).map((v) => v.mountPoint);
  const byVolume: Record<string, Record<string, number>> = {};
  for (const item of items) {
    const volume = volumeOf(item.path, mountPoints);
    if (!volume) continue;
    const categories = (byVolume[volume] ??= {});
    categories[item.category] = (categories[item.category] ?? 0) + item.sizeBytes;
  }
  return byVolume;
}

type Candidate = Omit<StorageVolume, "totalBytes" | "freeBytes" | "usedBytes">;

// --- macOS ---------------------------------------------------------------

/** "/" plus every local, non-disk-image volume mounted under /Volumes. */
async function macCandidates(): Promise<Candidate[]> {
  const mountPoints = ["/"];
  try {
    for (const entry of await fs.readdir("/Volumes", { withFileTypes: true })) {
      // The boot volume shows up here as a symlink to "/" ("Macintosh HD").
      if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
      if (entry.name.startsWith("com.apple.")) continue; // Time Machine local snapshots
      mountPoints.push(path.join("/Volumes", entry.name));
    }
  } catch {
    // /Volumes unreadable — show the system disk only
  }

  const candidates: Candidate[] = [];
  for (const mountPoint of mountPoints) {
    const isSystem = mountPoint === "/";
    let info: string;
    try {
      info = await run("diskutil", ["info", "-plist", mountPoint]);
    } catch {
      // Network shares aren't disks, so diskutil rejects them — skip them.
      // The system disk is always shown, even if diskutil is unavailable.
      if (isSystem) candidates.push({ mountPoint, name: null, kind: "internal", isSystem });
      continue;
    }
    if (plistString(info, "BusProtocol") === "Disk Image") continue;
    const internal = plistBool(info, "Internal") ?? isSystem;
    candidates.push({
      mountPoint,
      name: plistString(info, "VolumeName") || (isSystem ? null : path.basename(mountPoint)),
      kind: internal ? "internal" : "external",
      isSystem,
    });
  }
  return candidates;
}

function plistString(xml: string, key: string): string | null {
  const match = xml.match(new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`));
  return match ? decodeXml(match[1]) : null;
}

function plistBool(xml: string, key: string): boolean | null {
  const match = xml.match(new RegExp(`<key>${key}</key>\\s*<(true|false)/>`));
  return match ? match[1] === "true" : null;
}

function decodeXml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

// --- Linux ---------------------------------------------------------------

/** Mount points that belong to the system, not to a storage device the user sees. */
const LINUX_HIDDEN_PREFIXES = ["/boot", "/snap", "/var/snap", "/var/lib/docker", "/var/lib/containers"];
const LINUX_EXTERNAL_PREFIXES = ["/media/", "/run/media/", "/mnt/"];

/** Block devices from /proc/self/mounts, one entry per device (btrfs subvolumes repeat it). */
async function linuxCandidates(): Promise<Candidate[]> {
  let mounts: string;
  try {
    mounts = await fs.readFile("/proc/self/mounts", "utf8");
  } catch {
    return [{ mountPoint: "/", name: null, kind: "internal", isSystem: true }];
  }

  const byDevice = new Map<string, Candidate>();
  for (const line of mounts.split("\n")) {
    const [device, rawMountPoint, fsType] = line.split(" ");
    if (!device?.startsWith("/dev/") || device.startsWith("/dev/loop")) continue;
    if (fsType === "squashfs") continue;
    // /proc/mounts escapes spaces and tabs as octal (\040).
    const mountPoint = rawMountPoint.replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
    if (LINUX_HIDDEN_PREFIXES.some((p) => mountPoint === p || mountPoint.startsWith(`${p}/`))) continue;

    const isSystem = mountPoint === "/";
    const existing = byDevice.get(device);
    // Keep the shortest mount point of a device ("/" over "/home").
    if (existing && existing.mountPoint.length <= mountPoint.length) continue;
    byDevice.set(device, {
      mountPoint,
      name: isSystem ? null : path.basename(mountPoint),
      kind: LINUX_EXTERNAL_PREFIXES.some((p) => mountPoint.startsWith(p)) ? "external" : "internal",
      isSystem,
    });
  }

  const candidates = [...byDevice.values()];
  if (!candidates.some((c) => c.isSystem)) {
    candidates.unshift({ mountPoint: "/", name: null, kind: "internal", isSystem: true });
  }
  return candidates.sort((a, b) => Number(b.isSystem) - Number(a.isSystem));
}
