/**
 * Resolves a stored asset path to a displayable URL.
 *
 * In production (Apache + PHP on the same origin), relative paths like
 * `/uploads/models/...` resolve correctly as-is.
 *
 * In local dev the PHP server runs on a different port (9000) from the
 * Vite dev server (8080), so relative paths would hit the wrong server.
 * Set VITE_API_ORIGIN=http://localhost:9000 in .env.local to fix this.
 *
 * Safety net: if a URL was accidentally stored in the DB with an absolute
 * localhost origin (e.g. "http://localhost:9000/uploads/..."), strip the
 * origin so only the path is used. This prevents broken images in prod.
 */
export function assetUrl(path: string | null | undefined): string {
  if (!path) return "";

  // Strip any dev localhost origin that may have leaked into the database
  if (path.startsWith("http://localhost")) {
    try {
      path = new URL(path).pathname;
    } catch {
      // malformed URL — fall through and return as-is
    }
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("//")
  ) {
    return path;
  }
  const origin = import.meta.env.VITE_API_ORIGIN ?? "";
  return origin + path;
}
