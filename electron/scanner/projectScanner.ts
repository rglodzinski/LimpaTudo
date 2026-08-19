import fs from "node:fs";
import path from "node:path";
import { calculateSize } from "./sizeCalculator";
import type { Risk, ScanItem } from "../types";

export interface ScanProgress {
  completed: number;
  total: number;
}

const PROJECT_MARKERS = [
  "package.json",
  "requirements.txt",
  "build.gradle",
  "build.gradle.kts",
  "Podfile",
  "Cargo.toml",
];

/** Dependency/build directories we know how to safely measure and remove. */
const DEPENDENCY_DIRS: Array<{ name: string; risk: Risk }> = [
  { name: "node_modules", risk: "low" },
  { name: "venv", risk: "low" },
  { name: ".venv", risk: "low" },
  { name: "env", risk: "low" },
  { name: ".next", risk: "low" },
  { name: "build", risk: "medium" },
  { name: "dist", risk: "medium" },
  { name: "out", risk: "medium" },
  { name: "target", risk: "medium" },
];

/** Never recurse into these — they're either dependency dirs we already
 * handle above, or noise (.git) that can't contain further projects. */
const SKIP_DIR_NAMES = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "out",
  "target",
  "venv",
  ".venv",
  "env",
  ".gradle",
  "DerivedData",
  "Pods",
  ".cache",
]);

interface ProjectJob {
  projectDir: string;
  depName: string;
  depPath: string;
  risk: Risk;
}

/**
 * Finds development dependency/build directories inside configured project
 * roots (docs/01-categorias.md, "regras de descoberta de projetos de
 * desenvolvimento") — never an open-ended scan of the whole filesystem, only
 * the roots the user configured in Settings.
 */
export async function scanProjects(
  roots: string[],
  onChunk: (item: ScanItem) => void,
  onProgress: (progress: ScanProgress) => void,
  deadProjectThresholdDays: number,
  concurrency = 8,
): Promise<void> {
  const jobs: ProjectJob[] = [];
  for (const root of roots) {
    collectJobs(root, 0, jobs);
  }

  let completed = 0;
  const total = jobs.length;
  onProgress({ completed, total });
  if (total === 0) return;

  const staleThresholdMs = deadProjectThresholdDays * 24 * 60 * 60 * 1000;

  async function processOne(job: ProjectJob) {
    try {
      const { sizeBytes, permissionDenied } = await calculateSize(job.depPath);
      if (sizeBytes !== null && sizeBytes > 0) {
        let stale = false;
        try {
          stale = Date.now() - fs.statSync(job.depPath).mtimeMs > staleThresholdMs;
        } catch {
          /* ignore */
        }
        onChunk({
          id: `project:${job.depPath}`,
          entryId: `project.${job.depName}`,
          displayName: `${job.depName} — ${path.basename(job.projectDir)}`,
          category: "dev",
          risk: job.risk,
          path: job.depPath,
          sizeBytes,
          locked: false,
          stale,
        });
      } else if (permissionDenied) {
        onChunk({
          id: `project:${job.depPath}`,
          entryId: `project.${job.depName}`,
          displayName: `${job.depName} — ${path.basename(job.projectDir)}`,
          category: "dev",
          risk: job.risk,
          path: job.depPath,
          sizeBytes: 0,
          locked: true,
        });
      }
    } finally {
      completed += 1;
      onProgress({ completed, total });
    }
  }

  const queue = [...jobs];
  const workers = Array.from({ length: Math.min(concurrency, jobs.length) || 1 }, async () => {
    while (queue.length > 0) {
      const job = queue.shift();
      if (job) await processOne(job);
    }
  });
  await Promise.all(workers);
}

function collectJobs(dir: string, depth: number, jobs: ProjectJob[], maxDepth = 6) {
  if (depth > maxDepth) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  const hasMarker = entries.some((e) => e.isFile() && PROJECT_MARKERS.includes(e.name));
  if (hasMarker) {
    for (const dep of DEPENDENCY_DIRS) {
      const depPath = path.join(dir, dep.name);
      if (fs.existsSync(depPath)) {
        jobs.push({ projectDir: dir, depName: dep.name, depPath, risk: dep.risk });
      }
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.isSymbolicLink()) continue;
    if (entry.name.startsWith(".") && entry.name !== ".venv") continue;
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    collectJobs(path.join(dir, entry.name), depth + 1, jobs, maxDepth);
  }
}
