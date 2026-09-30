import fs from "node:fs";
import path from "node:path";
import { app } from "electron";
import { currentPlatform, expandHome } from "../platform";
import type { CatalogEntry } from "../types";

let cached: CatalogEntry[] | null = null;

function catalogPath(): string {
  // In dev, __dirname is app/electron/catalog (ts-node/tsc output mirrors src).
  // In production, the catalog is copied next to the packaged app resources.
  const devPath = path.join(app.getAppPath(), "catalog", "catalog.json");
  if (fs.existsSync(devPath)) return devPath;
  return path.join(process.resourcesPath, "catalog", "catalog.json");
}

export function loadCatalog(): CatalogEntry[] {
  if (cached) return cached;
  const raw = fs.readFileSync(catalogPath(), "utf-8");
  cached = JSON.parse(raw) as CatalogEntry[];
  return cached;
}

/** Catalog paths (this platform, wildcard-free) measured by unique file sizes. */
export function uniqueSizePaths(): string[] {
  const platform = currentPlatform();
  return loadCatalog()
    .filter((entry) => entry.sizeStrategy === "uniqueFileSizes")
    .flatMap((entry) => entry.paths[platform] ?? [])
    .filter((pattern) => !pattern.includes("*"))
    .map(expandHome);
}
