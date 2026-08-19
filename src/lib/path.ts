/** Renderer-side, pure-string equivalent of Node's path.dirname (no node:path in the browser context). */
export function dirname(filePath: string): string {
  const trimmed = filePath.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  if (idx <= 0) return "/";
  return trimmed.slice(0, idx);
}
