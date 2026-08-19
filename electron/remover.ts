import fs from "node:fs/promises";
import { shell } from "electron";
import type { RemoveOptions, RemoveReport, ScanItem } from "./types";

/**
 * Removes the given items, one at a time so a single failure doesn't abort
 * the rest. Defaults to moving items to the OS Trash; permanent deletion is
 * only used when explicitly opted into (docs/00-visao-geral.md, principle 2).
 */
export async function removeItems(
  items: ScanItem[],
  options: RemoveOptions,
): Promise<RemoveReport> {
  let freedBytes = 0;
  const entries: RemoveReport["entries"] = [];

  for (const item of items) {
    try {
      if (options.permanent) {
        await fs.rm(item.path, { recursive: true, force: true });
      } else {
        await shell.trashItem(item.path);
      }
      freedBytes += item.sizeBytes;
      entries.push({ itemId: item.id, path: item.path, ok: true });
    } catch (error) {
      entries.push({
        itemId: item.id,
        path: item.path,
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return { freedBytes, entries };
}
