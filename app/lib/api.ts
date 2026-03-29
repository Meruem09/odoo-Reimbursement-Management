/** Same-origin API base for browser fetches. */
export const API_PREFIX = "/api/auth";

export function authUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_PREFIX}${p}`;
}
