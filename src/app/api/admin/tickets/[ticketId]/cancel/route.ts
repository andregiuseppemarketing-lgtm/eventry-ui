/**
 * MILESTONE 7 - Admin API: Cancel Ticket
 * POST /api/admin/tickets/[ticketId]/cancel
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ ticketId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // ⚠️ SECURITY: Solo ADMIN
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { ticketId } = await context.params;

    // Get ticket
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        code: true,
        event: { select: { title: true } },
        user: { select: { email: true } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Cancel ticket
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { status: 'CANCELLED' },
    });

    // 🔍 AUDIT LOG
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CANCEL_TICKET',
        entity: 'TICKET',
        entityId: ticketId,
        details: {
          code: ticket.code,
          eventTitle: ticket.event.title,
          ownerEmail: ticket.user?.email,
          adminAction: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Ticket cancelled',
    });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
