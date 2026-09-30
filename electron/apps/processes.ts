import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { run } from "./inventory";
import type { AppRunningState, OpenAppFile } from "../types";

interface ProcessRow {
  pid: number;
  command: string;
}

async function processes(): Promise<ProcessRow[]> {
  const out = await run("ps", ["-axo", "pid=,command="]);
  return out
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const space = line.indexOf(" ");
      return { pid: Number(line.slice(0, space)), command: line.slice(space + 1) };
    });
}

/**
 * PIDs of every process running from inside the bundle (the app and its
 * helpers). Matching on the bundle path instead of a pgrep regex avoids
 * escaping names like "pgAdmin 4.app" or "Visual Studio Code.app".
 */
export async function runningPids(appPath: string): Promise<number[]> {
  const inside = `${appPath}/Contents/`;
  return (await processes()).filter((p) => p.command.startsWith(inside)).map((p) => p.pid);
}

/**
 * Splits the bundle's processes into the app itself (Contents/MacOS/…) and
 * background ones — e.g. WhatsApp's ServiceExtension keeps running from
 * Contents/PlugIns after the app is quit, holding its databases open.
 */
export async function runningState(appPath: string): Promise<AppRunningState> {
  const inside = `${appPath}/Contents/`;
  const state: AppRunningState = { main: false, helpers: [] };
  for (const p of await processes()) {
    if (!p.command.startsWith(inside)) continue;
    if (p.command.startsWith(`${inside}MacOS/`)) {
      state.main = true;
    } else {
      const executable = p.command.slice(inside.length).split(" -")[0];
      state.helpers.push({ pid: p.pid, name: path.basename(executable) });
    }
  }
  return state;
}

/**
 * Asks the bundle's background processes to quit (SIGTERM), only when the
 * app itself is closed — never the app's own process, which the user closes.
 * The OS relaunches extensions on demand, so this is harmless; it's what
 * lets the app's data be removed without a process writing to it.
 */
export async function stopHelpers(appPath: string): Promise<AppRunningState> {
  const state = await runningState(appPath);
  if (state.main) return state;
  for (const helper of state.helpers) {
    try {
      process.kill(helper.pid, "SIGTERM");
    } catch {
      // Already gone, or not ours to signal.
    }
  }
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return runningState(appPath);
}

/**
 * Whether anything still uses `bundleId`: a running process mentions it, or
 * Spotlight knows an app bundle with that id somewhere on disk.
 */
export async function isBundleIdInUse(bundleId: string): Promise<boolean> {
  if ((await processes()).some((p) => p.command.includes(bundleId))) return true;
  try {
    // bundleId is validated as reverse-DNS by the caller, so it can't carry quotes.
    const hits = await run("mdfind", [`kMDItemCFBundleIdentifier == '${bundleId}'`]);
    return hits.trim().length > 0;
  } catch {
    // Without Spotlight we can't rule it out — err on the side of keeping it.
    return true;
  }
}

/** Paths that are the system's or the app's own code, not data it writes. */
const IGNORED_PREFIXES = ["/System/", "/usr/", "/dev/", "/private/var/db/", "/Library/Fonts/"];
const MAX_OPEN_FILES = 300;

/**
 * Regular files the app's processes have open right now (`lsof`), largest
 * first — what the app is reading and writing at this moment. Read-only:
 * these are never offered for removal, since the app is using them.
 */
export async function openFiles(appPath: string): Promise<OpenAppFile[]> {
  const pids = await runningPids(appPath);
  if (pids.length === 0) return [];

  const stdout = await new Promise<string>((resolve) => {
    // lsof exits 1 when one of the pids vanished meanwhile, but still prints
    // the rest — so read stdout regardless of the exit code.
    execFile(
      "lsof",
      ["-n", "-P", "-w", "-p", pids.join(","), "-F", "tn"],
      { maxBuffer: 64 * 1024 * 1024 },
      (_error, out) => resolve(out ?? ""),
    );
  });

  const paths = new Set<string>();
  let type = "";
  for (const line of stdout.split("\n")) {
    if (line.startsWith("t")) type = line.slice(1);
    else if (line.startsWith("n") && type === "REG") {
      const p = line.slice(1);
      if (!p.startsWith("/")) continue;
      if (p.startsWith(appPath + path.sep)) continue;
      if (IGNORED_PREFIXES.some((prefix) => p.startsWith(prefix))) continue;
      paths.add(p);
    }
  }

  const files: OpenAppFile[] = [];
  for (const p of paths) {
    try {
      const stat = await fs.stat(p);
      if (stat.isFile()) files.push({ path: p, sizeBytes: stat.size });
    } catch {
      // Deleted or unreadable since lsof saw it.
    }
  }

  return files.sort((a, b) => b.sizeBytes - a.sizeBytes).slice(0, MAX_OPEN_FILES);
}
