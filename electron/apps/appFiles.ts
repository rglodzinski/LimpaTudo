import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { app } from "electron";
import { uniqueSizePaths } from "../catalog";
import { expandHome } from "../platform";
import { calculateSize } from "../scanner/sizeCalculator";
import type { AppFile, AppFileKind, AppMeasurement, InstalledApp, Risk } from "../types";

interface Location {
  dir: string;
  kind: AppFileKind;
  risk: Risk;
  /** Whether entries named after the app ("Postman") count, not only its bundle id. */
  byName: boolean;
}

const LIBRARY = path.join(os.homedir(), "Library");

/**
 * The only places searched for an app's data: fixed ~/Library folders, one
 * level deep (docs/08-apps-instalados.md). Caches, logs and window state are
 * rebuilt by the app, so they're 🟢; settings, containers and support data
 * hold the app's state and are 🟡.
 */
const LOCATIONS: Location[] = [
  { dir: "Application Support", kind: "support", risk: "medium", byName: true },
  { dir: "Caches", kind: "caches", risk: "low", byName: true },
  { dir: "Logs", kind: "logs", risk: "low", byName: true },
  { dir: "Saved Application State", kind: "state", risk: "low", byName: false },
  { dir: "HTTPStorages", kind: "web", risk: "low", byName: false },
  { dir: "WebKit", kind: "web", risk: "low", byName: false },
  { dir: "Cookies", kind: "web", risk: "medium", byName: false },
  { dir: "Preferences", kind: "preferences", risk: "medium", byName: false },
  { dir: "Preferences/ByHost", kind: "preferences", risk: "medium", byName: false },
  { dir: "Containers", kind: "containers", risk: "medium", byName: false },
  { dir: "Group Containers", kind: "containers", risk: "medium", byName: false },
  { dir: "Application Scripts", kind: "other", risk: "low", byName: false },
  { dir: "LaunchAgents", kind: "launch", risk: "medium", byName: false },
];

const EXTENSIONS = /\.(plist|savedState|binarycookies)$/i;

/** A reverse-DNS name (com.vendor.app) — the only shape attributable to a removed app. */
const BUNDLE_ID_SHAPE = /^[a-z][a-z0-9-]*(\.[a-z0-9_-]+){2,}$/i;

const measurements = new Map<string, AppMeasurement>();
const orphans = new Map<string, AppFile>();

function baseName(entry: string): string {
  return entry.replace(EXTENSIONS, "");
}

/** How well `entry` matches `bundleId`: the matched id's length, or 0. */
function bundleMatch(entry: string, bundleId: string, location: Location): number {
  const name = baseName(entry).toLowerCase();
  const id = bundleId.toLowerCase();
  if (name === id || name.startsWith(`${id}.`)) return id.length;
  // Group containers are prefixed with a team id or "group.":
  // "UBF8T346G9.com.microsoft.teams", "group.net.whatsapp.WhatsApp.shared".
  if (location.dir === "Group Containers" && (name.endsWith(`.${id}`) || name.includes(`.${id}.`))) {
    return id.length;
  }
  return 0;
}

function nameMatches(entry: string, target: InstalledApp): boolean {
  if (target.bundleId?.startsWith("com.apple.")) return false;
  const name = baseName(entry).toLowerCase();
  return [target.name, target.bundleName]
    .filter((n): n is string => !!n && n.length >= 3)
    .some((n) => n.toLowerCase() === name);
}

function listDir(dir: string): string[] {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

/**
 * Assigns each entry in the known ~/Library folders to at most one installed
 * app: the one whose bundle id matches most specifically, else one whose name
 * matches exactly. Keeping it one-to-one means an entry is never listed (and
 * counted) under two apps.
 */
function attribute(apps: InstalledApp[]): Map<string, Array<Omit<AppFile, "sizeBytes" | "locked">>> {
  const byApp = new Map<string, Array<Omit<AppFile, "sizeBytes" | "locked">>>();
  for (const a of apps) byApp.set(a.path, []);

  for (const location of LOCATIONS) {
    const dir = path.join(LIBRARY, location.dir);
    for (const entry of listDir(dir)) {
      let best: InstalledApp | null = null;
      let bestScore = 0;
      for (const candidate of apps) {
        if (!candidate.bundleId) continue;
        const score = bundleMatch(entry, candidate.bundleId, location);
        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }
      if (!best && location.byName) {
        best = apps.find((candidate) => nameMatches(entry, candidate)) ?? null;
      }
      if (!best) continue;

      const full = path.join(dir, entry);
      byApp.get(best.path)!.push({ id: full, path: full, kind: location.kind, risk: location.risk });
    }
  }

  const extras = loadExtras();
  for (const a of apps) {
    for (const pattern of (a.bundleId && extras[a.bundleId]) || []) {
      for (const full of resolvePattern(expandHome(pattern))) {
        const location = locationOf(full);
        byApp.get(a.path)!.push({
          id: full,
          path: full,
          kind: location?.kind ?? "other",
          risk: location?.risk ?? "medium",
        });
      }
    }
  }

  for (const [appPath, files] of byApp) byApp.set(appPath, withoutNested(files));
  return byApp;
}

/** The known ~/Library folder `full` sits in, if any — the deepest one wins (ByHost over Preferences). */
function locationOf(full: string): Location | undefined {
  return LOCATIONS.filter((l) => full.startsWith(path.join(LIBRARY, l.dir) + path.sep)).sort(
    (a, b) => b.dir.length - a.dir.length,
  )[0];
}

/** Drops duplicates and anything already inside another listed folder. */
function withoutNested<T extends { path: string }>(files: T[]): T[] {
  const sorted = [...files].sort((a, b) => a.path.length - b.path.length);
  const kept: T[] = [];
  for (const file of sorted) {
    if (kept.some((k) => file.path === k.path || file.path.startsWith(k.path + path.sep))) continue;
    kept.push(file);
  }
  return kept;
}

let extrasCache: Record<string, string[]> | null = null;

/**
 * Data some apps keep outside the folders named after them (Xcode's
 * ~/Library/Developer, Android Studio's SDK…), from catalog/app-leftovers.json.
 */
function loadExtras(): Record<string, string[]> {
  if (extrasCache) return extrasCache;
  const devPath = path.join(app.getAppPath(), "catalog", "app-leftovers.json");
  const file = fs.existsSync(devPath)
    ? devPath
    : path.join(process.resourcesPath, "catalog", "app-leftovers.json");
  try {
    extrasCache = JSON.parse(fs.readFileSync(file, "utf-8")) as Record<string, string[]>;
  } catch {
    extrasCache = {};
  }
  return extrasCache;
}

/** Resolves a path whose last segment may end in "*" (e.g. ".../AndroidStudio*"). */
function resolvePattern(pattern: string): string[] {
  const last = path.basename(pattern);
  if (!last.endsWith("*")) return fs.existsSync(pattern) ? [pattern] : [];
  const prefix = last.slice(0, -1);
  const dir = path.dirname(pattern);
  return listDir(dir)
    .filter((entry) => entry.startsWith(prefix))
    .map((entry) => path.join(dir, entry));
}

async function measure<T extends { path: string }>(file: T): Promise<T & { sizeBytes: number; locked: boolean }> {
  // A folder holding a clone-heavy catalog path (WhatsApp's group container
  // holds its media) would be wildly overcounted by `du`.
  const clones = uniqueSizePaths().some((p) => p === file.path || p.startsWith(file.path + path.sep));
  const { sizeBytes, permissionDenied } = await calculateSize(
    file.path,
    clones ? "uniqueFileSizes" : "du",
  );
  return { ...file, sizeBytes: sizeBytes ?? 0, locked: sizeBytes === null && permissionDenied };
}

/**
 * Measures every app's bundle and the data attributed to it, reporting each
 * app as soon as it's done. Results are kept so a later uninstall can only
 * act on paths found here, never on paths supplied by the renderer.
 */
export async function measureApps(
  apps: InstalledApp[],
  onMeasured: (measurement: AppMeasurement) => void,
  concurrency = 4,
): Promise<void> {
  const attributed = attribute(apps);
  measurements.clear();

  const queue = [...apps];
  const workers = Array.from({ length: Math.min(concurrency, queue.length) || 1 }, async () => {
    while (queue.length > 0) {
      const target = queue.shift();
      if (!target) continue;
      const bundle = await measure({
        id: `${target.path}::bundle`,
        path: target.path,
        kind: "bundle" as const,
        risk: "medium" as const,
      });
      const data = [];
      for (const file of attributed.get(target.path) ?? []) {
        const measured = await measure(file);
        if (measured.sizeBytes > 0 || measured.locked) data.push(measured);
      }
      data.sort((a, b) => b.sizeBytes - a.sizeBytes);
      const measurement: AppMeasurement = {
        appPath: target.path,
        sizeBytes: bundle.sizeBytes,
        files: [bundle, ...data],
      };
      measurements.set(target.path, measurement);
      onMeasured(measurement);
    }
  });
  await Promise.all(workers);
}

export function measurementOf(appPath: string): AppMeasurement | undefined {
  return measurements.get(appPath);
}

const MIN_ORPHAN_BYTES = 100 * 1024;

/**
 * Data left behind by apps that are no longer installed. Only entries named
 * like a bundle id qualify — a folder called "Arc" can't be tied to anything
 * with confidence. An entry is skipped when it belongs to an installed app,
 * shares a vendor with one (com.microsoft.* while Office is installed), is
 * Apple's, belongs to a running process, or Spotlight still knows an app with
 * that bundle id somewhere on disk. Always 🟡: this is a best guess.
 */
export async function findOrphans(
  apps: InstalledApp[],
  isBundleIdInUse: (bundleId: string) => Promise<boolean>,
): Promise<AppFile[]> {
  const installedIds = apps.map((a) => a.bundleId?.toLowerCase()).filter((id): id is string => !!id);
  const vendors = new Set(installedIds.map((id) => id.split(".").slice(0, 2).join(".")));
  const attributed = new Set(
    [...attribute(apps).values()].flat().map((f) => f.path),
  );

  const candidates: Array<Omit<AppFile, "sizeBytes" | "locked">> = [];
  for (const location of LOCATIONS) {
    if (location.kind === "preferences" || location.kind === "launch") continue;
    if (location.dir === "Group Containers") continue;
    const dir = path.join(LIBRARY, location.dir);
    for (const entry of listDir(dir)) {
      const id = baseName(entry);
      const lower = id.toLowerCase();
      const full = path.join(dir, entry);
      if (!BUNDLE_ID_SHAPE.test(id)) continue;
      if (lower.startsWith("com.apple.") || lower.startsWith("group.") || lower.startsWith("systemgroup.")) continue;
      if (attributed.has(full)) continue;
      if (vendors.has(lower.split(".").slice(0, 2).join("."))) continue;
      candidates.push({ id: full, path: full, kind: location.kind, risk: "medium", bundleId: id });
    }
  }

  const inUse = new Map<string, boolean>();
  const found: AppFile[] = [];
  for (const candidate of candidates) {
    const id = candidate.bundleId!;
    if (!inUse.has(id)) inUse.set(id, await isBundleIdInUse(id));
    if (inUse.get(id)) continue;
    const measured = await measure(candidate);
    if (measured.sizeBytes >= MIN_ORPHAN_BYTES) found.push(measured);
  }

  orphans.clear();
  for (const file of found) orphans.set(file.id, file);
  return found.sort((a, b) => b.sizeBytes - a.sizeBytes);
}

export function orphanOf(id: string): AppFile | undefined {
  return orphans.get(id);
}
