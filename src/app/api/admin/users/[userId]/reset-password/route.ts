/**
 * MILESTONE 7 - Admin API: Reset User Password
 * POST /api/admin/users/[userId]/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ⚠️ SECURITY: Solo ADMIN
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId } = await context.params;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token
    await prisma.user.update({
      where: { id: userId },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Generate reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;

    // Send email
    await sendPasswordResetEmail(
      user.email,
      user.firstName || 'Utente',
      resetUrl
    );

    // 🔍 AUDIT LOG
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'RESET_PASSWORD',
        entity: 'USER',
        entityId: userId,
        details: {
          targetEmail: user.email,
          adminAction: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
