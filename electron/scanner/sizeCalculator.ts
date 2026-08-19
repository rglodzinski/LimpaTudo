import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

/** Returns the size in bytes of `targetPath`, or null if it doesn't exist. */
export async function calculateSize(targetPath: string): Promise<number | null> {
  try {
    await fs.access(targetPath);
  } catch {
    return null;
  }

  try {
    return await sizeViaDu(targetPath);
  } catch {
    return sizeViaReaddir(targetPath);
  }
}

function sizeViaDu(targetPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // -s: summary only, -k: sizes in 1024-byte blocks (consistent across macOS/Linux).
    execFile("du", ["-sk", targetPath], (error, stdout) => {
      if (error) return reject(error);
      const kb = parseInt(stdout.trim().split(/\s+/)[0] ?? "", 10);
      if (Number.isNaN(kb)) return reject(new Error(`Unexpected du output: ${stdout}`));
      resolve(kb * 1024);
    });
  });
}

/** Pure-JS fallback if `du` is unavailable. Does not follow symlinks. */
async function sizeViaReaddir(targetPath: string): Promise<number> {
  const stat = await fs.lstat(targetPath);
  if (stat.isSymbolicLink()) return 0;
  if (!stat.isDirectory()) return stat.size;

  let total = 0;
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isSymbolicLink()) continue;
    total += entry.isDirectory()
      ? await sizeViaReaddir(entryPath)
      : (await fs.lstat(entryPath)).size;
  }
  return total;
}
