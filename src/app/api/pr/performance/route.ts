import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/pr/performance?period=month|year
 * 
 * Dashboard PR: eventi assegnati con metriche individuali + invite links
 * Requires: User role === 'PR'
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // Verifica autenticazione
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Verifica ruolo PR
    if (session.user.role !== 'PR') {
      return NextResponse.json(
        { error: 'Accesso riservato ai PR' },
        { status: 403 }
      );
    }

    // Trova PRProfile
    const prProfile = await prisma.pRProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        displayName: true,
        referralCode: true,
      },
    });

    if (!prProfile) {
      return NextResponse.json(
        { error: 'Profilo PR non trovato. Contatta l\'amministratore.' },
        { status: 404 }
      );
    }

    // Parse period (default: month)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';

    // Calcola date range
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      // year
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    // Trova eventi assegnati al PR nel periodo
    const assignments = await prisma.assignment.findMany({
      where: {
        prProfileId: prProfile.id,
        event: {
          dateStart: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            status: true,
          },
        },
      },
      orderBy: {
        event: {
          dateStart: 'desc',
        },
      },
    });

    // Calcola metriche per ogni evento
    const eventsPerformance = await Promise.all(
      assignments.slice(0, 20).map(async (assignment) => {
        const eventId = assignment.eventId;

        // Trova liste del PR per questo evento
        const lists = await prisma.list.findMany({
          where: { eventId },
          select: { id: true },
        });

        const listIds = lists.map((l) => l.id);

        // Count ListEntry (persone in lista)
        const listEntriesCount = listIds.length > 0 
          ? await prisma.listEntry.count({
              where: {
                listId: { in: listIds },
                // Filtro per persone aggiunte dal PR
                addedByUserId: session.user.id,
              },
            })
          : 0;

        // Count Ticket emessi dalle liste del PR
        const ticketsCount = listIds.length > 0
          ? await prisma.ticket.count({
              where: {
                eventId,
                listEntry: {
                  listId: { in: listIds },
                  addedByUserId: session.user.id,
                },
              },
            })
          : 0;

        // Count CheckIn effettivi
        const checkinsCount = listIds.length > 0
          ? await prisma.checkIn.count({
              where: {
                ticket: {
                  eventId,
                  listEntry: {
                    listId: { in: listIds },
                    addedByUserId: session.user.id,
                  },
                },
              },
            })
          : 0;

        // Calcola revenue dai ticket
        const ticketsRevenue = listIds.length > 0
          ? await prisma.ticket.aggregate({
              where: {
                eventId,
                listEntry: {
                  listId: { in: listIds },
                  addedByUserId: session.user.id,
                },
              },
              _sum: {
                price: true,
              },
            })
          : { _sum: { price: 0 } };

        const revenue = ticketsRevenue._sum.price || 0;

        // Conversion rate
        const conversionRate = ticketsCount > 0 
          ? (checkinsCount / ticketsCount) * 100 
          : 0;

        return {
          eventId: assignment.event.id,
          eventTitle: assignment.event.title,
          eventDate: assignment.event.dateStart,
          eventStatus: assignment.event.status,
          quotaTotal: assignment.quotaTotal,
          quotaFemale: assignment.quotaFemale,
          quotaMale: assignment.quotaMale,
          peopleBrought: listEntriesCount,
          ticketsIssued: ticketsCount,
          checkins: checkinsCount,
          conversionRate: Math.round(conversionRate * 10) / 10,
          revenue: Math.round(revenue * 100) / 100,
          quotaUsagePercent: assignment.quotaTotal 
            ? Math.round((listEntriesCount / assignment.quotaTotal) * 100)
            : null,
        };
      })
    );

    // Trova invite links del PR
    const inviteLinks = await prisma.inviteLink.findMany({
      where: {
        prProfileId: prProfile.id,
        event: {
          dateStart: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        event: {
          select: {
            title: true,
            dateStart: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit a 50 link più recenti
    });

    const inviteLinksData = inviteLinks.map((link) => ({
      slug: link.slug,
      eventTitle: link.event.title,
      eventDate: link.event.dateStart,
      uses: link.uses,
      maxUses: link.maxUses,
      usagePercent: link.maxUses 
        ? Math.round((link.uses / link.maxUses) * 100)
        : null,
      createdAt: link.createdAt,
    }));

    // Calcola aggregati
    const totalPeopleBrought = eventsPerformance.reduce(
      (sum, e) => sum + e.peopleBrought,
      0
    );
    const totalTickets = eventsPerformance.reduce(
      (sum, e) => sum + e.ticketsIssued,
      0
    );
    const totalCheckins = eventsPerformance.reduce(
      (sum, e) => sum + e.checkins,
      0
    );
    const totalRevenue = eventsPerformance.reduce(
      (sum, e) => sum + e.revenue,
      0
    );
    const avgConversionRate = totalTickets > 0
      ? Math.round((totalCheckins / totalTickets) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      prProfile: {
        displayName: prProfile.displayName,
        referralCode: prProfile.referralCode,
      },
      aggregates: {
        totalEvents: eventsPerformance.length,
        totalPeopleBrought,
        totalTickets,
        totalCheckins,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        avgConversionRate,
      },
      events: eventsPerformance,
      inviteLinks: inviteLinksData,
      period,
      periodStart: startDate.toISOString(),
      periodEnd: endDate.toISOString(),
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });

  } catch (error) {
    console.error('PR Performance API error:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
