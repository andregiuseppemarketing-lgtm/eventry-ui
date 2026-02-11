import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

type DayCount = {
  [key: string]: number;
};

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    console.log('[Metrics] Inizio aggiornamento metriche...');

    const guests = await prisma.guest.findMany({
      include: {
        listEntries: {
          include: {
            list: {
              include: {
                event: true,
              },
            },
          },
        },
      },
    });

    const guestIds = guests.map(guest => guest.id);

    const tickets = guestIds.length
      ? await prisma.ticket.findMany({
          where: {
            guestId: {
              in: guestIds,
            },
          },
          include: {
            event: true,
            checkins: true,
          },
        })
      : [];

    const ticketsByGuest = tickets.reduce((acc, ticket) => {
      const guestId = String(ticket.guestId);
      if (!acc[guestId]) {
        acc[guestId] = [];
      }
      acc[guestId].push(ticket);
      return acc;
    }, {} as Record<string, typeof tickets>);

    let updated = 0;
    const errors: string[] = [];

    for (const guest of guests) {
      try {
        const eventIds = new Set<string>();
        const checkInDates: Date[] = [];
        const groupSizes: number[] = [];
        const guestTickets = ticketsByGuest[String(guest.id)] ?? [];

        for (const entry of guest.listEntries) {
          if (entry.list.event) {
            eventIds.add(entry.list.eventId);
          }
        }

        for (const ticket of guestTickets) {
          if (ticket.checkins && ticket.checkins.length > 0) {
            eventIds.add(ticket.eventId);
            
            for (const checkin of ticket.checkins) {
              checkInDates.push(new Date(checkin.scannedAt));
              if (checkin.groupSize) {
                groupSizes.push(checkin.groupSize);
              }
            }
          }
        }

        const totalEvents = eventIds.size;

        let lastEventDate: Date | null = null;
        const allEventDates = [
          ...guest.listEntries.map(e => e.list.event?.dateStart).filter(Boolean),
          ...guestTickets.map(t => t.event.dateStart).filter(Boolean),
        ] as Date[];

        if (allEventDates.length > 0) {
          lastEventDate = new Date(Math.max(...allEventDates.map(d => d.getTime())));
        }

        let customerSegment: 'NEW' | 'OCCASIONAL' | 'REGULAR' | 'VIP' | 'DORMANT' = 'NEW';
        
        if (totalEvents === 0) {
          customerSegment = 'NEW';
        } else if (lastEventDate) {
          const daysSinceLastEvent = Math.floor(
            (Date.now() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysSinceLastEvent > 90) {
            customerSegment = 'DORMANT';
          } else if (totalEvents >= 10) {
            customerSegment = 'VIP';
          } else if (totalEvents >= 5) {
            customerSegment = 'REGULAR';
          } else if (totalEvents >= 2) {
            customerSegment = 'OCCASIONAL';
          }
        }

        const dayCounts: DayCount = {};
        for (const date of checkInDates) {
          const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        }

        const preferredDays = Object.entries(dayCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([day]) => day)
          .join(', ');

        let averageArrivalTime: string | null = null;
        if (checkInDates.length > 0) {
          const totalMinutes = checkInDates.reduce((sum, date) => {
            return sum + date.getHours() * 60 + date.getMinutes();
          }, 0);
          const avgMinutes = Math.floor(totalMinutes / checkInDates.length);
          const hours = Math.floor(avgMinutes / 60);
          const minutes = avgMinutes % 60;
          averageArrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        const averageGroupSize = groupSizes.length > 0
          ? Math.round(groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length)
          : 1;

        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            totalEvents,
            lastEventDate,
            customerSegment,
            preferredDays: preferredDays || null,
            averageArrivalTime,
            averageGroupSize,
          },
        });

        updated++;
      } catch (error) {
        console.error(`[Metrics] Errore guest ${guest.id}:`, error);
        errors.push(`Guest ${guest.id}: ${error}`);
      }
    }

    const segments = await prisma.guest.groupBy({
      by: ['customerSegment'],
      _count: true,
    });

    const segmentStats = segments.reduce((acc, s) => {
      acc[s.customerSegment] = s._count;
      return acc;
    }, {} as Record<string, number>);

    console.log('[Metrics] Aggiornamento completato:', {
      updated,
      errors: errors.length,
      segments: segmentStats,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalGuests: guests.length,
        updated,
        errors: errors.length,
        errorDetails: errors.slice(0, 10),
        segments: segmentStats,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('[Metrics] Errore generale:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante l\'aggiornamento delle metriche',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Endpoint disponibile solo in development' },
      { status: 403 }
    );
  }

  return POST(request);
}
