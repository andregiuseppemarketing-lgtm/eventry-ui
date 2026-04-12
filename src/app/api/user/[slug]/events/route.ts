import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse } from '@/lib/api';

/**
 * GET /api/user/[slug]/events
 * Ritorna gli eventi a cui l'utente ha partecipato (futuri + passati)
 * Query params: ?filter=future|past&page=1&limit=10
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const searchParams = req.nextUrl.searchParams;
    const filter = searchParams.get('filter') || 'all'; // all, future, past
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Trova userProfile
    const userProfile = await prisma.userProfile.findUnique({
      where: { slug },
      select: { 
        userId: true,
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        createApiResponse(undefined, 'Utente non trovato', 404)
      );
    }

    const userId = userProfile.user.id;
    const now = new Date();

    // Costruisci where clause
    let dateFilter = {};
    if (filter === 'future') {
      dateFilter = { dateStart: { gte: now } };
    } else if (filter === 'past') {
      dateFilter = { dateEnd: { lt: now } };
    }

    // Query eventi
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          status: {
            in: ['PUBLISHED', 'CLOSED'],
          },
          ...dateFilter,
          tickets: {
            some: {
              userId: userId,
              status: {
                in: ['NEW', 'PAID', 'ARRIVED', 'ADMITTED', 'CHECKED_IN'],
              },
            },
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          coverUrl: true,
          dateStart: true,
          dateEnd: true,
          status: true,
          ticketType: true,
          venue: {
            select: {
              name: true,
              city: true,
            },
          },
          _count: {
            select: {
              tickets: true,
            },
          },
        },
        orderBy: {
          dateStart: filter === 'past' ? 'desc' : 'asc',
        },
        take: limit,
        skip,
      }),
      prisma.event.count({
        where: {
          status: {
            in: ['PUBLISHED', 'CLOSED'],
          },
          ...dateFilter,
          tickets: {
            some: {
              userId: userId,
              status: {
                in: ['NEW', 'PAID', 'ARRIVED', 'ADMITTED', 'CHECKED_IN'],
              },
            },
          },
        },
      }),
    ]);

    // Separa futuri/passati se filter=all
    let futureEvents = events;
    let pastEvents: typeof events = [];

    if (filter === 'all') {
      futureEvents = events.filter((e) => new Date(e.dateStart) >= now);
      pastEvents = events.filter((e) => {
        const endDate = e.dateEnd ? new Date(e.dateEnd) : new Date(e.dateStart);
        return endDate < now;
      });
    }

    const hasMore = skip + events.length < total;

    return NextResponse.json(
      createApiResponse({
        futureEvents,
        pastEvents,
        pagination: {
          page,
          limit,
          total,
          hasMore,
        },
      })
    );
  } catch (error) {
    console.error('[API] Error fetching user events:', error);
    return NextResponse.json(
      createApiResponse(undefined, 'Errore durante il recupero degli eventi', 500)
    );
  }
}
