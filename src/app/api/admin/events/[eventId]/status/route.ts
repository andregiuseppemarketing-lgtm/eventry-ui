/**
 * MILESTONE 7 - Admin API: Change Event Status
 * PATCH /api/admin/events/[eventId]/status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statusSchema = z.object({
  status: z.enum(['PUBLISHED', 'DRAFT', 'CANCELLED']),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ⚠️ SECURITY: Solo ADMIN
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { eventId } = await context.params;
    const body = await req.json();
    const { status } = statusSchema.parse(body);

    // Update event status
    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    // 🔍 AUDIT LOG
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CHANGE_EVENT_STATUS',
        entity: 'EVENT',
        entityId: eventId,
        details: {
          newStatus: status,
          eventTitle: event.title,
        },
      },
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Change event status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
