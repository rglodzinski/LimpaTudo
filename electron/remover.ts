import fs from "node:fs";
import fsp from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { shell } from "electron";
import { confirmElevation, execElevated, shellQuote } from "./elevate";
import type { RemoveOptions, RemoveReport, ScanItem } from "./types";

export interface RemoveProgress {
  completed: number;
  total: number;
}

/** Error recorded for items that needed the admin password when the user cancelled the prompt. */
export const ADMIN_DENIED = "ADMIN_DENIED";

/**
 * Removes the given items, one at a time so a single failure doesn't abort
 * the rest. Defaults to moving items to the OS Trash; permanent deletion is
 * only used when explicitly opted into (docs/00-visao-geral.md, principle 2).
 *
 * Items that fail because they belong to root (or sit in a folder only root
 * can write) are retried together, after the others, with a single admin
 * password prompt — but only those `canElevate` accepts. The elevated path
 * still moves to the Trash (and gives the moved item back to the user, so
 * emptying the Trash doesn't ask for the password again).
 *
 * `shouldCancel` is checked between items — if it returns true, remaining
 * items are left untouched and the report reflects only what was actually
 * attempted (see "Interromper Limpeza" in the UI).
 */
export async function removeItems(
  items: ScanItem[],
  options: RemoveOptions,
  onProgress: (progress: RemoveProgress) => void = () => {},
  shouldCancel: () => boolean = () => false,
  canElevate: (item: ScanItem) => boolean = () => false,
): Promise<RemoveReport> {
  let freedBytes = 0;
  const entries: RemoveReport["entries"] = [];
  const needAdmin: ScanItem[] = [];
  const total = items.length;

  for (const [index, item] of items.entries()) {
    if (shouldCancel()) break;

    try {
      if (options.permanent) {
        await fsp.rm(item.path, { recursive: true, force: true });
      } else {
        await shell.trashItem(item.path);
      }
      freedBytes += item.sizeBytes;
      entries.push({ itemId: item.id, path: item.path, ok: true });
    } catch (error) {
      if (canElevate(item) && needsAdmin(item.path)) {
        needAdmin.push(item);
      } else {
        entries.push({ itemId: item.id, path: item.path, ok: false, error: messageOf(error) });
      }
    }

    onProgress({ completed: index + 1, total });
  }

  if (needAdmin.length > 0 && !shouldCancel()) {
    for (const result of await removeElevated(needAdmin, options)) {
      if (result.ok) freedBytes += result.item.sizeBytes;
      entries.push({ itemId: result.item.id, path: result.item.path, ok: result.ok, error: result.error });
    }
  }

  return { freedBytes, entries };
}

/** True when moving `target` needs root: it belongs to someone else, or its folder isn't writable. */
function needsAdmin(target: string): boolean {
  try {
    const stat = fs.lstatSync(target);
    if (typeof process.getuid === "function" && stat.uid !== process.getuid()) return true;
    fs.accessSync(path.dirname(target), fs.constants.W_OK);
    return false;
  } catch {
    return fs.existsSync(target);
  }
}

interface ElevatedResult {
  item: ScanItem;
  ok: boolean;
  error?: string;
}

/** Moves (or permanently deletes) `items` as root, with one password prompt for all of them. */
async function removeElevated(items: ScanItem[], options: RemoveOptions): Promise<ElevatedResult[]> {
  const uid = process.getuid?.() ?? 0;
  const gid = process.getgid?.() ?? 0;
  const trash = options.permanent ? null : trashTarget();
  const taken = new Set<string>();

  const plan = items.map((item) => {
    if (!trash) return { item, dest: null, command: `rm -rf -- ${shellQuote(item.path)}` };
    const dest = uniqueDestination(trash.files, path.basename(item.path), taken);
    // `;` between items: one failure doesn't stop the rest, the result is
    // read back from the filesystem below.
    const command = `{ mv -- ${shellQuote(item.path)} ${shellQuote(dest)} && chown -R ${uid}:${gid} ${shellQuote(dest)}; }`;
    return { item, dest, command };
  });

  try {
    if (!(await confirmElevation(items.map((item) => item.path), options.permanent))) {
      return items.map((item) => ({ item, ok: false, error: ADMIN_DENIED }));
    }
    await execElevated(plan.map((p) => p.command).join("; ") + "; true");
  } catch {
    return items.map((item) => ({ item, ok: false, error: ADMIN_DENIED }));
  }

  return plan.map(({ item, dest }) => {
    const gone = !fs.existsSync(item.path);
    if (gone && dest && trash?.info) writeTrashInfo(trash.info, dest, item.path);
    return gone ? { item, ok: true } : { item, ok: false, error: "EPERM" };
  });
}

/** The current user's Trash: ~/.Trash on macOS, the freedesktop Trash on Linux. */
function trashTarget(): { files: string; info: string | null } {
  if (process.platform === "darwin") return { files: path.join(os.homedir(), ".Trash"), info: null };
  const base = path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"), "Trash");
  const files = path.join(base, "files");
  const info = path.join(base, "info");
  fs.mkdirSync(files, { recursive: true });
  fs.mkdirSync(info, { recursive: true });
  return { files, info };
}

function uniqueDestination(dir: string, name: string, taken: Set<string>): string {
  let candidate = path.join(dir, name);
  for (let n = 2; taken.has(candidate) || fs.existsSync(candidate); n++) {
    candidate = path.join(dir, `${name} ${n}`);
  }
  taken.add(candidate);
  return candidate;
}

/** Writes the .trashinfo a freedesktop Trash needs to show "Restore" for `dest`. */
function writeTrashInfo(infoDir: string, dest: string, original: string) {
  const date = new Date().toISOString().slice(0, 19);
  const body = `[Trash Info]\nPath=${encodeURI(original)}\nDeletionDate=${date}\n`;
  try {
    fs.writeFileSync(path.join(infoDir, `${path.basename(dest)}.trashinfo`), body);
  } catch {
    // The item is in the Trash either way; only "Restore" would be missing.
  }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
