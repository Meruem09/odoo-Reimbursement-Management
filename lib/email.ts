import { Resend } from "resend";
import { getAppUrl } from "./env";

const resendKey = process.env.RESEND_API_KEY?.trim();
const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

function getResend(): Resend {
  return new Resend(resendKey!);
}

function devLog(label: string, url: string) {
  console.warn(`[email][dev] ${label}:`, url);
}

// ─── Email Verification (Admin Signup) ────────────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  token: string
): Promise<void> {
  const base = getAppUrl();
  const verifyUrl = `${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`;

  if (!resendKey) {
    devLog("Verification link", verifyUrl);
    return;
  }

  const { error } = await getResend().emails.send({
    from,
    to,
    subject: "Verify your email — ReimbursePro",
    html: `
      <h2>Welcome to ReimbursePro!</h2>
      <p>Click the link below to verify your email address and activate your account:</p>
      <p><a href="${verifyUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Verify Email</a></p>
      <p>This link expires in 24 hours.</p>
      <p style="color:#888;font-size:12px">If you didn't sign up, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error("Failed to send verification email");
  }
}

// ─── Invite (First-Time Password Setup) ──────────────────────────────────────

export async function sendInviteEmail(
  to: string,
  name: string,
  inviterName: string,
  token: string
): Promise<void> {
  const base = getAppUrl();
  const setupUrl = `${base}/setup-password?token=${encodeURIComponent(token)}`;

  if (!resendKey) {
    devLog("Invite / setup link", setupUrl);
    return;
  }

  const { error } = await getResend().emails.send({
    from,
    to,
    subject: `${inviterName} invited you to ReimbursePro`,
    html: `
      <h2>You've been invited to ReimbursePro</h2>
      <p>Hi ${name},</p>
      <p><strong>${inviterName}</strong> has added you to their organisation on ReimbursePro.</p>
      <p>Click the link below to set your password and get started:</p>
      <p><a href="${setupUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Set Your Password</a></p>
      <p>This link expires in 48 hours.</p>
      <p style="color:#888;font-size:12px">If you weren't expecting this invitation, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error("Failed to send invite email");
  }
}

// ─── Password Reset ────────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(
  to: string,
  token: string
): Promise<void> {
  const base = getAppUrl();
  const resetUrl = `${base}/reset-password?token=${encodeURIComponent(token)}`;

  if (!resendKey) {
    devLog("Password reset link", resetUrl);
    return;
  }

  const { error } = await getResend().emails.send({
    from,
    to,
    subject: "Reset your ReimbursePro password",
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below:</p>
      <p><a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">Reset Password</a></p>
      <p>This link expires in 1 hour.</p>
      <p style="color:#888;font-size:12px">If you didn't request this, you can safely ignore this email.</p>
    `,
  });

  if (error) {
    console.error("[email] Resend error:", error);
    throw new Error("Failed to send password reset email");
  }
}
