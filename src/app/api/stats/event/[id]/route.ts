import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

/**
 * GET /api/stats/event/[id]
 * Get comprehensive event statistics
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    
    // Check if event exists and user has access
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    // Check permissions
    if (event.createdByUserId !== user.id && user.role !== 'ADMIN') {
      return ApiErrors.forbidden();
    }

    // Get basic counts
    const [
      totalEntries,
      totalTickets,
      totalCheckins,
      entriesByStatus,
      ticketsByType,
      checkinsByHour,
      entriesByPR,
      entriesByGender,
      inviteStats,
    ] = await Promise.all([
      // Total list entries
      prisma.listEntry.count({
        where: {
          list: { eventId: id },
        },
      }),

      // Total tickets
      prisma.ticket.count({
        where: { eventId: id },
      }),

      // Total check-ins
      prisma.checkIn.count({
        where: {
          ticket: { eventId: id },
        },
      }),

      // Entries by status
      prisma.listEntry.groupBy({
        by: ['status'],
        where: {
          list: { eventId: id },
        },
        _count: true,
      }),

      // Tickets by type
      prisma.ticket.groupBy({
        by: ['type', 'status'],
        where: { eventId: id },
        _count: true,
      }),

      // Check-ins by hour
      prisma.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM "scannedAt") as hour,
          COUNT(*) as checkins
        FROM "checkins" c
        JOIN "tickets" t ON c."ticketId" = t.id
        WHERE t."eventId" = ${id}
        GROUP BY EXTRACT(HOUR FROM "scannedAt")
        ORDER BY hour
      `,

      // Entries by PR
      prisma.listEntry.groupBy({
        by: ['addedByUserId'],
        where: {
          list: { eventId: id },
        },
        _count: true,
      }),

      // Entries by gender
      prisma.listEntry.groupBy({
        by: ['gender'],
        where: {
          list: { eventId: id },
        },
        _count: true,
      }),

      // Invite link stats
      prisma.inviteLink.findMany({
        where: { eventId: id },
        select: {
          id: true,
          slug: true,
          uses: true,
          maxUses: true,
          createdBy: {
            select: { name: true },
          },
          prProfile: {
            select: { displayName: true },
          },
        },
      }),
    ]);

    // Get PR names for entries by PR
    const prIds = entriesByPR.map((entry: any) => entry.addedByUserId);
    const prUsers = await prisma.user.findMany({
      where: { id: { in: prIds } },
      select: { id: true, name: true },
    });

    // Get tickets and check-ins for each PR
    const entriesByPRWithDetails = await Promise.all(
      entriesByPR.map(async (entry: { addedByUserId: string; _count: number }) => {
        const prUser = prUsers.find((u: { id: string; name: string | null }) => u.id === entry.addedByUserId);
        
        const [ticketsCount, checkinsCount] = await Promise.all([
          prisma.ticket.count({
            where: {
              eventId: id,
              listEntry: {
                addedByUserId: entry.addedByUserId,
              },
            },
          }),
          prisma.checkIn.count({
            where: {
              ticket: {
                eventId: id,
                listEntry: {
                  addedByUserId: entry.addedByUserId,
                },
              },
            },
          }),
        ]);

        return {
          prName: prUser?.name || 'Unknown',
          entries: entry._count,
          tickets: ticketsCount,
          checkins: checkinsCount,
        };
      })
    );

    // Calculate rates
    const conversionRate = totalEntries > 0 ? (totalTickets / totalEntries) * 100 : 0;
    const checkinRate = totalTickets > 0 ? (totalCheckins / totalTickets) * 100 : 0;

    // Format gender stats
    const entriesByGenderFormatted = {
      F: entriesByGender.find((g: { gender: string; _count: number }) => g.gender === 'F')?._count || 0,
      M: entriesByGender.find((g: { gender: string; _count: number }) => g.gender === 'M')?._count || 0,
      NB: entriesByGender.find((g: { gender: string; _count: number }) => g.gender === 'NB')?._count || 0,
      UNK: entriesByGender.find((g: { gender: string; _count: number }) => g.gender === 'UNK')?._count || 0,
    };

    // Format peak times
    const peakTimes = (checkinsByHour as any[]).map(item => ({
      hour: Number(item.hour),
      checkins: Number(item.checkins),
    }));

    const stats = {
      totalEntries,
      totalTickets,
      totalCheckins,
      conversionRate: Math.round(conversionRate * 100) / 100,
      checkinRate: Math.round(checkinRate * 100) / 100,
      
      entriesByStatus: entriesByStatus.reduce((acc: Record<string, number>, item: { status: string; _count: number }) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      
      ticketsByType: ticketsByType.reduce((acc: Record<string, Record<string, number>>, item: { type: string; status: string; _count: number }) => {
        if (!acc[item.type]) acc[item.type] = {};
        acc[item.type][item.status] = item._count;
        return acc;
      }, {} as Record<string, Record<string, number>>),
      
      entriesByPR: entriesByPRWithDetails,
      entriesByGender: entriesByGenderFormatted,
      peakTimes,
      
      inviteLinks: inviteStats.map((invite: {
        id: string;
        slug: string;
        uses: number;
        maxUses: number | null;
        createdBy: { name: string | null };
        prProfile: { displayName: string | null } | null;
      }) => ({
        id: invite.id,
        slug: invite.slug,
        uses: invite.uses,
        maxUses: invite.maxUses,
        conversionRate: invite.maxUses ? 
          Math.round((invite.uses / invite.maxUses) * 100) : 0,
        createdBy: invite.createdBy.name,
        prName: invite.prProfile?.displayName,
      })),
    };

    return createApiResponse(stats);

  } catch (error) {
    console.error('Event stats error:', error);
    return ApiErrors.internal('Failed to fetch event statistics');
  }
}