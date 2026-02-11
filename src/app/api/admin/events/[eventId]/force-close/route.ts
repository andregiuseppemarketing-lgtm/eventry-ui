/**
 * MILESTONE 7 - Admin API: Force Close Event
 * POST /api/admin/events/[eventId]/force-close
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
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

    // Get event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Force close: set status to CANCELLED
    await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CANCELLED',
      },
    });

    // 🔍 AUDIT LOG
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'FORCE_CLOSE_EVENT',
        entity: 'EVENT',
        entityId: eventId,
        details: {
          eventTitle: event.title,
          adminAction: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Event force closed',
    });
  } catch (error) {
    console.error('Force close event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
