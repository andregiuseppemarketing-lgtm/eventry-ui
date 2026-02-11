/**
 * MILESTONE 7 - Admin API: Change User Role
 * PATCH /api/admin/users/[userId]/role
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const roleSchema = z.object({
  role: z.enum(['USER', 'PR', 'STAFF', 'ORGANIZER', 'ADMIN']),
});

export async function PATCH(
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
    const body = await req.json();
    const { role } = roleSchema.parse(body);

    // Update user role
    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    // 🔍 AUDIT LOG
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CHANGE_ROLE',
        entity: 'USER',
        entityId: userId,
        details: {
          newRole: role,
          targetEmail: user.email,
        },
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Change role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
