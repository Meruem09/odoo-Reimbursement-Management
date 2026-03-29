const resendTracker = new Map<string, { count: number; windowStart: number }>();
const RESEND_MAX = 3;
const RESEND_WINDOW_MS = 30 * 60 * 1000;

export function canResendVerification(email: string): boolean {
  const now = Date.now();
  const entry = resendTracker.get(email);
  if (!entry || now - entry.windowStart > RESEND_WINDOW_MS) {
    resendTracker.set(email, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RESEND_MAX) return false;
  entry.count += 1;
  return true;
}
