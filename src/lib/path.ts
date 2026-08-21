/** Renderer-side, pure-string equivalent of Node's path.dirname (no node:path in the browser context). */
export function dirname(filePath: string): string {
  const trimmed = filePath.replace(/\/+$/, "");
  const idx = trimmed.lastIndexOf("/");
  if (idx <= 0) return "/";
  return trimmed.slice(0, idx);
}

/**
 * Renders a home-relative path as "~/apps/RhNumbers". Group headers show full
 * paths, and the "/Users/<name>/" prefix is the same on every line — dropping
 * it is what makes the part that actually differs readable.
 */
export function shortenHome(filePath: string): string {
  return filePath.replace(/^\/(?:Users|home)\/[^/]+/, "~");
}
