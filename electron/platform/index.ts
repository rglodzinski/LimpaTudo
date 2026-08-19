import os from "node:os";
import path from "node:path";
import type { Platform } from "../types";

export function currentPlatform(): Platform {
  const p = os.platform();
  if (p === "darwin") return "darwin";
  if (p === "linux") return "linux";
  throw new Error(`Unsupported platform: ${p}. Limpa Tudo only supports macOS and Linux.`);
}

/** Expands a leading "~" to the user's home directory. */
export function expandHome(p: string): string {
  if (p === "~") return os.homedir();
  if (p.startsWith("~/")) return path.join(os.homedir(), p.slice(2));
  return p;
}
