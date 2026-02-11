import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, ApiErrors } from '@/lib/api';

/**
 * GET /api/tickets/[code]
 * Get ticket information by code (public endpoint)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      include: {
        event: {
          include: {
            venue: {
              select: { name: true, address: true, city: true },
            },
          },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        listEntry: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            plusOne: true,
          },
        },
        checkins: {
          include: {
            scannedBy: {
              select: { name: true },
            },
          },
          orderBy: { scannedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return ApiErrors.notFound('Ticket');
    }

    // Check if ticket is expired
    const now = new Date();
    const eventEnd = ticket.event.dateEnd || ticket.event.dateStart;
    const isExpired = now > new Date(eventEnd.getTime() + 24 * 60 * 60 * 1000); // 24h after event

    const response = {
      id: ticket.id,
      code: ticket.code,
      type: ticket.type,
      status: ticket.status,
      qrData: ticket.qrData,
      issuedAt: ticket.issuedAt,
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        dateStart: ticket.event.dateStart,
        dateEnd: ticket.event.dateEnd,
        venue: ticket.event.venue,
        status: ticket.event.status,
      },
      holder: ticket.user || ticket.listEntry,
      isUsed: ticket.status === 'USED',
      isExpired,
      isCancelled: ticket.status === 'CANCELLED',
      lastCheckin: ticket.checkins[0] || null,
    };

    return createApiResponse(response);

  } catch (error) {
    console.error('Ticket fetch error:', error);
    return ApiErrors.internal('Failed to fetch ticket');
  }
}