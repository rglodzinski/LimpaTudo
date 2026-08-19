import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { execElevated, isPermissionError, shellQuote } from "../elevate";

export interface SizeResult {
  sizeBytes: number | null;
  /** True when the size couldn't be read because of a permission error. */
  permissionDenied: boolean;
}

/**
 * Returns the size in bytes of `targetPath`. Never throws: any filesystem
 * error (missing path, permission denied, etc.) resolves to a result object
 * instead, so one inaccessible item never aborts the whole scan
 * (docs/04-fluxo-scan-e-remocao.md, "casos de borda"). Does not prompt for
 * elevated privileges — see `calculateSizeElevated` for that, used on-demand
 * per item instead of automatically during a concurrent scan.
 */
export async function calculateSize(targetPath: string): Promise<SizeResult> {
  try {
    await fs.access(targetPath);
  } catch {
    return { sizeBytes: null, permissionDenied: false };
  }

  try {
    return { sizeBytes: await sizeViaDu(targetPath), permissionDenied: false };
  } catch (duError) {
    try {
      return { sizeBytes: await sizeViaReaddir(targetPath), permissionDenied: false };
    } catch (readdirError) {
      const denied = isPermissionError(readdirError) || isPermissionError(duError);
      return { sizeBytes: null, permissionDenied: denied };
    }
  }
}

/**
 * Retries measuring `targetPath` with elevated (admin) privileges, prompting
 * the user for their password via the OS's native authorization dialog.
 * Called on-demand for a single item the user explicitly asks to retry —
 * never automatically for every locked item found during a scan.
 */
export async function calculateSizeElevated(targetPath: string): Promise<SizeResult> {
  try {
    const stdout = await execElevated(`du -sk ${shellQuote(targetPath)}`);
    const kb = parseInt(stdout.trim().split(/\s+/)[0] ?? "", 10);
    if (Number.isNaN(kb)) return { sizeBytes: null, permissionDenied: true };
    return { sizeBytes: kb * 1024, permissionDenied: false };
  } catch {
    // Some paths are protected by macOS TCC (e.g. need Full Disk Access)
    // and stay unreadable even as root — the caller should point the user
    // at System Settings instead of retrying with sudo again.
    return { sizeBytes: null, permissionDenied: true };
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
    try {
      if (entry.isSymbolicLink()) continue;
      total += entry.isDirectory()
        ? await sizeViaReaddir(entryPath)
        : (await fs.lstat(entryPath)).size;
    } catch (error) {
      // A single unreadable child (permission, race with another process
      // deleting it, etc.) shouldn't blow up the whole directory's total.
      if (!isPermissionError(error)) throw error;
    }
  }
  return total;
}
