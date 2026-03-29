import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM = 'onboarding@resend.dev';

export async function sendWelcomePasswordEmail(to: string, passwordPlain: string, name: string) {
  if (!resend) {
    console.log(`[EMAIL MOCK] To: ${to} | Name: ${name} | Password: ${passwordPlain}`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `RMS Admin <${DEFAULT_FROM}>`,
      to: [to],
      subject: 'Welcome to the Reimbursement Management System',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome aboard, ${name}!</h2>
          <p>Your administrator has created an account for you in the Reimbursement Management System.</p>
          <p>Your temporary password is: <strong>${passwordPlain}</strong></p>
          <p>Please log in and we recommend you change this password via the "Forgot Password" flow as soon as possible.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error Output:', error);
    }
    return data;
  } catch (error) {
    console.error('Email send failed', error);
  }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
  if (!resend) {
    console.log(`[EMAIL MOCK] To: ${to} | Reset Link: ${resetLink}`);
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `RMS Admin <${DEFAULT_FROM}>`,
      to: [to],
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. If you didn't request this, you can safely ignore this email.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}" style="display:inline-block; padding:10px 20px; background-color:#1a1a2e; color:#fff; text-decoration:none; border-radius:5px;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">If the button doesn't work, copy this link into your browser: <br/>${resetLink}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend Error Output:', error);
    }
    return data;
  } catch (error) {
    console.error('Email send failed', error);
  }
}
