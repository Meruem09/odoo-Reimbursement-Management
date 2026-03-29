import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // For security, don't reveal if user exists, just return ok.
      return NextResponse.json({ message: 'If an account exists, a reset link was sent.' }, { status: 200 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Token valid for 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        type: 'RESET',
        expiresAt,
      }
    });

    // Create absolute URL for front-end client reset link
    const resetUrl = new URL(`/reset-password?token=${token}`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString();

    // Send email asynchronously
    sendPasswordResetEmail(email, resetUrl);

    return NextResponse.json({ message: 'If an account exists, a reset link was sent.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to process forgot password', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
