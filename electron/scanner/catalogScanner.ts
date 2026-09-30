import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../catalog";
import { expandHome, currentPlatform } from "../platform";
import { calculateSize } from "./sizeCalculator";
import type { Risk, ScanItem } from "../types";

export interface ScanProgress {
  completed: number;
  total: number;
}

/**
 * Resolves every catalog entry's glob paths against the real filesystem and
 * measures the ones that exist. Only walks paths declared in the catalog
 * (see docs/01-categorias.md, docs/02-apps-viloes.md) — never an open-ended scan.
 *
 * `onProgress` fires after each catalog path is processed (found or not) so
 * the UI can render a percentage; `onChunk` fires only for items worth
 * showing the user (existing, non-empty, or permission-denied).
 */
export async function scanCatalog(
  onChunk: (item: ScanItem) => void,
  onProgress: (progress: ScanProgress) => void,
  concurrency = 8,
  risks?: Risk[],
): Promise<void> {
  const platform = currentPlatform();
  const entries = loadCatalog().filter((entry) => !risks || risks.includes(entry.risk));

  const paths: Array<{ entry: (typeof entries)[number]; resolved: string }> = [];
  // Catch-all entries ("every folder in ~/Library/Caches") go last and skip
  // anything a specific entry already claims — or contains — so no folder is
  // listed, and counted, twice.
  const ordered = [...entries.filter((e) => !e.catchAll), ...entries.filter((e) => e.catchAll)];
  for (const entry of ordered) {
    const patterns = entry.paths[platform] ?? [];
    for (const pattern of patterns) {
      for (const resolved of resolveGlob(expandHome(pattern))) {
        if (entry.catchAll && paths.some((p) => overlaps(p.resolved, resolved))) continue;
        paths.push({ entry, resolved });
      }
    }
  }
  // A path inside another listed one (DiagnosticReports inside ~/Library/Logs)
  // is already measured — and removed — with its parent.
  const nested = (resolved: string) => paths.some((p) => resolved.startsWith(p.resolved + path.sep));
  const measured = paths.filter((p) => !nested(p.resolved));

  let completed = 0;
  const total = measured.length;
  onProgress({ completed, total });

  async function processOne({ entry, resolved }: (typeof paths)[number]) {
    try {
      const { sizeBytes, permissionDenied } = await calculateSize(resolved, entry.sizeStrategy);
      // A catch-all turns up dozens of tiny or OS-protected folders; listing
      // them would bury the ones worth cleaning.
      if (entry.catchAll && (sizeBytes === null || sizeBytes < CATCH_ALL_MIN_BYTES)) return;
      if (sizeBytes !== null && sizeBytes > 0) {
        onChunk({
          id: `${entry.id}:${resolved}`,
          entryId: entry.id,
          displayName: entry.catchAll ? `${entry.displayName}: ${path.basename(resolved)}` : entry.displayName,
          category: entry.category,
          risk: entry.risk,
          path: resolved,
          sizeBytes,
          locked: false,
        });
      } else if (permissionDenied) {
        onChunk({
          id: `${entry.id}:${resolved}`,
          entryId: entry.id,
          displayName: entry.displayName,
          category: entry.category,
          risk: entry.risk,
          path: resolved,
          sizeBytes: 0,
          locked: true,
        });
      }
    } finally {
      completed += 1;
      onProgress({ completed, total });
    }
  }

  await runWithConcurrency(
    measured.map((p) => () => processOne(p)),
    concurrency,
  );
}

/**
 * Resolves catalog path patterns with at most one "*" segment (e.g.
 * ".../Chrome/*\/Cache" for versioned profile directories). Only lists
 * direct children of the segment preceding the wildcard — never recurses
 * into arbitrary subtrees.
 */
function resolveGlob(pattern: string): string[] {
  if (!pattern.includes("*")) {
    return fs.existsSync(pattern) ? [pattern] : [];
  }

  const segments = pattern.split(path.sep);
  const wildcardIndex = segments.indexOf("*");
  const baseDir = segments.slice(0, wildcardIndex).join(path.sep) || path.sep;
  const rest = segments.slice(wildcardIndex + 1);

  if (!fs.existsSync(baseDir)) return [];
  return fs
    .readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(baseDir, entry.name, ...rest))
    .filter((resolved) => fs.existsSync(resolved));
}

const CATCH_ALL_MIN_BYTES = 1024 * 1024;

function overlaps(a: string, b: string): boolean {
  return a === b || a.startsWith(b + path.sep) || b.startsWith(a + path.sep);
}

async function runWithConcurrency(jobs: Array<() => Promise<void>>, limit: number) {
  const queue = [...jobs];
  const workers = Array.from({ length: Math.min(limit, jobs.length) || 1 }, async () => {
    while (queue.length > 0) {
      const job = queue.shift();
      if (job) await job();
    }
  });
  await Promise.all(workers);
}
