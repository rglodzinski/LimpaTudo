import { removeItems, type RemoveProgress } from "../remover";
import { measurementOf, orphanOf } from "./appFiles";
import { isBundleIdInUse, runningPids } from "./processes";
import type { AppFile, RemoveOptions, RemoveReport, ScanItem, UninstallResult } from "../types";

function toScanItem(file: AppFile, entryId: string): ScanItem {
  return {
    id: file.id,
    entryId,
    displayName: entryId,
    category: "uninstall",
    risk: file.risk,
    path: file.path,
    sizeBytes: file.sizeBytes,
    locked: false,
  };
}

/**
 * Removes the chosen files of one app. Only ids from the app's last
 * measurement are honored, so the renderer can't point this at arbitrary
 * paths. Refuses while the app is running (docs/00-visao-geral.md,
 * principle 4). The bundle goes first: if it can't be removed (e.g. owned by
 * root), the app's data is left alone rather than orphaning a working app.
 */
export async function uninstallApp(
  appPath: string,
  fileIds: string[],
  options: RemoveOptions,
  onProgress: (progress: RemoveProgress) => void,
  shouldCancel: () => boolean,
): Promise<UninstallResult> {
  const measurement = measurementOf(appPath);
  if (!measurement) return { ok: false, reason: "unknown-app" };
  if ((await runningPids(appPath)).length > 0) return { ok: false, reason: "running" };

  const wanted = new Set(fileIds);
  const items = measurement.files
    .filter((f) => wanted.has(f.id) && !f.locked)
    .map((f) => toScanItem(f, appPath));
  const bundle = items.find((i) => i.path === appPath);
  const data = items.filter((i) => i !== bundle);
  const total = items.length;

  let report: RemoveReport = { freedBytes: 0, entries: [] };
  if (bundle) {
    report = await removeItems([bundle], options);
    onProgress({ completed: 1, total });
    if (!report.entries[0]?.ok) return { ok: true, report };
  }

  const offset = report.entries.length;
  const rest = await removeItems(
    data,
    options,
    (p) => onProgress({ completed: offset + p.completed, total }),
    shouldCancel,
  );
  return {
    ok: true,
    report: {
      freedBytes: report.freedBytes + rest.freedBytes,
      entries: [...report.entries, ...rest.entries],
    },
  };
}

/** Removes leftovers of uninstalled apps found by the last `findOrphans`. */
export async function removeOrphans(
  ids: string[],
  options: RemoveOptions,
  onProgress: (progress: RemoveProgress) => void,
  shouldCancel: () => boolean,
): Promise<RemoveReport> {
  const items: ScanItem[] = [];
  for (const id of ids) {
    const file = orphanOf(id);
    if (!file || file.locked) continue;
    // Re-check: the app may have been reinstalled or started since the scan.
    if (await isBundleIdInUse(file.bundleId!)) continue;
    items.push(toScanItem(file, file.bundleId!));
  }
  return removeItems(items, options, onProgress, shouldCancel);
}
