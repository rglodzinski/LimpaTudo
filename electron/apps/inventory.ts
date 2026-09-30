import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { InstalledApp } from "../types";

/**
 * Where user-installed apps live. Folders inside them (e.g. "Canon Utilities")
 * are followed up to MAX_DEPTH levels, but never into a .app bundle.
 */
const APP_DIRS = ["/Applications", path.join(os.homedir(), "Applications")];
const MAX_DEPTH = 2;

/**
 * Lists the .app bundles the user can uninstall. Apps that are part of macOS
 * (their real location is under /System, like /Applications/Safari.app, a
 * symlink into the sealed system volume) are left out entirely.
 */
export async function listInstalledApps(): Promise<InstalledApp[]> {
  const bundles: string[] = [];
  for (const dir of APP_DIRS) {
    await collectBundles(dir, 0, bundles);
  }

  const apps: InstalledApp[] = [];
  for (const bundle of bundles) {
    const info = await readApp(bundle);
    if (info) apps.push(info);
  }
  return apps;
}

async function collectBundles(dir: string, depth: number, out: string[]) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.name.endsWith(".app")) {
      if (await isSystemApp(full)) continue;
      out.push(full);
    } else if (entry.isDirectory() && depth < MAX_DEPTH) {
      await collectBundles(full, depth + 1, out);
    }
  }
}

async function isSystemApp(bundlePath: string): Promise<boolean> {
  try {
    const real = await fs.realpath(bundlePath);
    return real.startsWith("/System/");
  } catch {
    return true;
  }
}

async function readApp(bundlePath: string): Promise<InstalledApp | null> {
  const plist = await readInfoPlist(path.join(bundlePath, "Contents", "Info.plist"));
  if (!plist) return null;

  return {
    path: bundlePath,
    // The Finder shows the bundle's file name, so that's the display name;
    // CFBundleName is often a short internal one ("Code" for Visual Studio
    // Code) that data folders tend to be named after.
    name: path.basename(bundlePath, ".app"),
    bundleName: stringOrNull(plist.CFBundleName),
    bundleId: stringOrNull(plist.CFBundleIdentifier),
    version: stringOrNull(plist.CFBundleShortVersionString) ?? stringOrNull(plist.CFBundleVersion),
    lastUsedAt: await lastUsedAt(bundlePath),
    fromAppStore: await exists(path.join(bundlePath, "Contents", "_MASReceipt", "receipt")),
    icon: await iconOf(bundlePath, stringOrNull(plist.CFBundleIconFile)),
  };
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

async function readInfoPlist(plistPath: string): Promise<Record<string, unknown> | null> {
  if (!(await exists(plistPath))) return null;
  try {
    const json = await run("plutil", ["-convert", "json", "-o", "-", plistPath]);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    // plutil can't express some plist types (dates, data) as JSON; fall back
    // to reading just the keys we need, one at a time.
    const result: Record<string, unknown> = {};
    for (const key of [
      "CFBundleIdentifier",
      "CFBundleIconFile",
      "CFBundleName",
      "CFBundleShortVersionString",
      "CFBundleVersion",
    ]) {
      try {
        result[key] = (await run("plutil", ["-extract", key, "raw", "-o", "-", plistPath])).trim();
      } catch {
        // key absent
      }
    }
    return result;
  }
}

async function lastUsedAt(bundlePath: string): Promise<string | null> {
  try {
    const raw = (await run("mdls", ["-name", "kMDItemLastUsedDate", "-raw", bundlePath])).trim();
    if (!raw || raw === "(null)") return null;
    const date = new Date(raw.replace(" ", "T").replace(" +0000", "Z"));
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  } catch {
    return null;
  }
}

/**
 * The app's icon as a 64px PNG data URL, converted from the bundle's .icns
 * with `sips`. Not app.getFileIcon: on macOS it renders the icon on a
 * Chromium thread-pool thread (NSImage/UTType off the main thread) and
 * crashes the whole process with SIGTRAP when called for a list of apps.
 */
async function iconOf(bundlePath: string, iconFile: string | null): Promise<string | null> {
  if (!iconFile) return null;
  const name = iconFile.endsWith(".icns") ? iconFile : `${iconFile}.icns`;
  const source = path.join(bundlePath, "Contents", "Resources", name);
  if (!(await exists(source))) return null;

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "limpatudo-icon-"));
  const target = path.join(dir, "icon.png");
  try {
    await run("sips", ["-s", "format", "png", "-Z", "64", source, "--out", target]);
    return `data:image/png;base64,${(await fs.readFile(target)).toString("base64")}`;
  } catch {
    return null;
  } finally {
    await fs.rm(dir, { recursive: true, force: true });
  }
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export function run(cmd: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 32 * 1024 * 1024 }, (error, stdout) => {
      if (error) return reject(error);
      resolve(stdout);
    });
  });
}
