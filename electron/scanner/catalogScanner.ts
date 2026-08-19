import fs from "node:fs";
import path from "node:path";
import { loadCatalog } from "../catalog";
import { expandHome, currentPlatform } from "../platform";
import { calculateSize } from "./sizeCalculator";
import type { ScanItem } from "../types";

/**
 * Resolves every catalog entry's glob paths against the real filesystem and
 * measures the ones that exist. Only walks paths declared in the catalog
 * (see docs/01-categorias.md, docs/02-apps-viloes.md) — never an open-ended scan.
 */
export async function scanCatalog(
  onChunk: (item: ScanItem) => void,
  concurrency = 8,
): Promise<void> {
  const platform = currentPlatform();
  const entries = loadCatalog();
  const jobs: Array<() => Promise<void>> = [];

  for (const entry of entries) {
    const patterns = entry.paths[platform] ?? [];
    for (const pattern of patterns) {
      jobs.push(async () => {
        for (const resolved of resolveGlob(expandHome(pattern))) {
          const sizeBytes = await calculateSize(resolved);
          if (sizeBytes === null || sizeBytes === 0) continue;
          onChunk({
            id: `${entry.id}:${resolved}`,
            entryId: entry.id,
            displayName: entry.displayName,
            category: entry.category,
            risk: entry.risk,
            path: resolved,
            sizeBytes,
          });
        }
      });
    }
  }

  await runWithConcurrency(jobs, concurrency);
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
  const workers = Array.from({ length: limit }, async () => {
    while (queue.length > 0) {
      const job = queue.shift();
      if (job) await job();
    }
  });
  await Promise.all(workers);
}
