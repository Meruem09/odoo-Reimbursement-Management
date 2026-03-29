import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendWelcomePasswordEmail } from '@/lib/email';
import { getAuthUserId } from '@/lib/api-auth';

// Helper to get database user from the JWT request auth
async function getDbUser(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { company: true }
  });

  return user;
}

export async function GET(request: NextRequest) {
  const user = await getDbUser(request);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const employees = await prisma.user.findMany({
      where: { companyId: user.companyId },
      include: {
        manager: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Failed to fetch employees', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const adminUser = await getDbUser(request);
  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { name, email, role, managerId } = await request.json();

    if (!name || !email || !role) {
      return NextResponse.json({ error: 'Name, email, and role are required' }, { status: 400 });
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Generate random secure password (8 characters)
    const randomPassword = crypto.randomBytes(4).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        managerId: managerId || null,
        companyId: adminUser.companyId,
        isVerified: true, // admin created, automatically verified internally
        isPasswordSet: true,
      },
      include: {
        manager: {
          select: { name: true }
        }
      }
    });

    // Send the email asynchronously without blocking the response
    sendWelcomePasswordEmail(email, randomPassword, name);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create employee', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const adminUser = await getDbUser(request);
  if (!adminUser || adminUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
  }

  try {
    const { id, name, role, managerId } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        role: role || undefined,
        managerId: managerId === "" ? null : (managerId || undefined),
      },
      include: {
        manager: {
          select: { name: true }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update employee', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
