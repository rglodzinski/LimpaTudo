import fs from "node:fs/promises";
import { shell } from "electron";
import type { RemoveOptions, RemoveReport, ScanItem } from "./types";

export interface RemoveProgress {
  completed: number;
  total: number;
}

/**
 * Removes the given items, one at a time so a single failure doesn't abort
 * the rest. Defaults to moving items to the OS Trash; permanent deletion is
 * only used when explicitly opted into (docs/00-visao-geral.md, principle 2).
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
): Promise<RemoveReport> {
  let freedBytes = 0;
  const entries: RemoveReport["entries"] = [];
  const total = items.length;

  for (const [index, item] of items.entries()) {
    if (shouldCancel()) break;

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

    onProgress({ completed: index + 1, total });
  }

  return { freedBytes, entries };
}
