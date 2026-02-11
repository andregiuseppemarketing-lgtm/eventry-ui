import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

/**
 * GET /api/stats/dashboard?period=month|year
 * Get dashboard statistics for current user filtered by period
 */
export async function GET(req: NextRequest) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') || 'month'; // 'month' or 'year'

    const isAdmin = user.role === 'ADMIN';
    const isOrganizer = user.role === 'ORGANIZER';
    const isPR = user.role === 'PR';

    let eventsWhere: any = {};

    // Filter events based on role
    if (!isAdmin) {
      if (isOrganizer) {
        eventsWhere.createdByUserId = user.id;
      } else if (isPR) {
        eventsWhere.assignments = {
          some: {
            prProfile: {
              userId: user.id,
            },
          },
        };
      } else {
        // Regular users see no events in dashboard
        return createApiResponse({
          totalEvents: 0,
          totalTickets: 0,
          totalCheckins: 0,
          upcomingEvents: 0,
        });
      }
    }

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'month') {
      // Start of current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      // End of current month
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      // Start of current year
      startDate = new Date(now.getFullYear(), 0, 1);
      // End of current year
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    const periodFilter = {
      dateStart: {
        gte: startDate,
        lte: endDate,
      },
    };

    // Calculate total events in period
    const totalEvents = await prisma.event.count({
      where: {
        ...eventsWhere,
        ...periodFilter,
      },
    });

    // Calculate upcoming events (future events in the period)
    const upcomingEvents = await prisma.event.count({
      where: {
        ...eventsWhere,
        dateStart: {
          gte: now,
        },
        status: 'PUBLISHED',
      },
    });

    // Get events to calculate tickets and check-ins
    const events = await prisma.event.findMany({
      where: {
        ...eventsWhere,
        ...periodFilter,
      },
      select: { id: true },
    });

    const eventIds = events.map((e) => e.id);

    // Calculate total tickets (QR emessi)
    const totalTickets = eventIds.length > 0 ? await prisma.ticket.count({
      where: {
        eventId: { in: eventIds },
      },
    }) : 0;

    // Calculate total check-ins (ingressi effettivi)
    const totalCheckins = eventIds.length > 0 ? await prisma.checkIn.count({
      where: {
        ticket: {
          eventId: { in: eventIds },
        },
      },
    }) : 0;

    return Response.json(
      {
        ok: true,
        data: {
          totalEvents,
          totalTickets,
          totalCheckins,
          upcomingEvents,
          period,
          periodStart: startDate.toISOString(),
          periodEnd: endDate.toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          // Cache per 30 secondi, stale-while-revalidate 60s
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return ApiErrors.internal('Failed to fetch dashboard statistics');
  }
}
