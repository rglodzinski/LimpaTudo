import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../catalog";
import { expandHome, currentPlatform } from "../platform";
import { calculateSize } from "./sizeCalculator";
import type { ScanItem } from "../types";

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
): Promise<void> {
  const platform = currentPlatform();
  const entries = loadCatalog();

  const paths: Array<{ entry: (typeof entries)[number]; resolved: string }> = [];
  for (const entry of entries) {
    const patterns = entry.paths[platform] ?? [];
    for (const pattern of patterns) {
      for (const resolved of resolveGlob(expandHome(pattern))) {
        paths.push({ entry, resolved });
      }
    }
  }

  let completed = 0;
  const total = paths.length;
  onProgress({ completed, total });

  async function processOne({ entry, resolved }: (typeof paths)[number]) {
    try {
      const { sizeBytes, permissionDenied } = await calculateSize(resolved);
      if (sizeBytes !== null && sizeBytes > 0) {
        onChunk({
          id: `${entry.id}:${resolved}`,
          entryId: entry.id,
          displayName: entry.displayName,
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
    paths.map((p) => () => processOne(p)),
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
