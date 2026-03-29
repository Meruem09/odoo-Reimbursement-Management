/** App origin for redirects and absolute URLs (no trailing slash). */
export function getAppUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export function getJwtSecret(): Uint8Array {
  let s = process.env.JWT_SECRET?.trim();
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === "development") {
      s = "development-only-jwt-secret-min-32-chars!";
    } else {
      throw new Error(
        "JWT_SECRET must be set to a random string of at least 32 characters"
      );
    }
  }
  return new TextEncoder().encode(s);
}
