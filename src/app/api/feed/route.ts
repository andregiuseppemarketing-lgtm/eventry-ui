import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

// ISR: Cache per 60 secondi per feed pubblico
export const revalidate = 60;
// Dynamic route - usa headers per auth
export const dynamic = "force-dynamic";

/**
 * GET /api/feed
 * Restituisce eventi pubblici dagli utenti/organizzazioni/locali seguiti
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Trova tutti gli utenti seguiti
    const follows = await prisma.userFollow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });

    const followingIds = follows.map((f) => f.followingId);

    if (followingIds.length === 0) {
      return NextResponse.json({
        events: [],
        total: 0,
        hasMore: false,
      });
    }

    // Trova eventi creati dagli utenti seguiti
    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: {
          createdByUserId: { in: followingIds },
          status: 'PUBLISHED', // Solo eventi pubblicati
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              firstName: true,
              lastName: true,
              image: true,
              userProfile: {
                select: {
                  slug: true,
                  avatar: true,
                  verifiedBadge: true,
                },
              },
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              city: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.event.count({
        where: {
          createdByUserId: { in: followingIds },
          status: 'PUBLISHED',
        },
      }),
    ]);

    return NextResponse.json({
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        description: event.description,
        startDate: event.dateStart,
        endDate: event.dateEnd,
        coverUrl: event.coverUrl,
        status: event.status,
        minAge: event.minAge,
        dressCode: event.dressCode,
        createdBy: {
          id: event.createdBy.id,
          name: event.createdBy.name || event.createdBy.firstName || 'Organizzatore',
          image: event.createdBy.userProfile?.avatar || event.createdBy.image,
          slug: event.createdBy.userProfile?.slug,
          verified: event.createdBy.userProfile?.verifiedBadge || false,
        },
        venue: event.venue
          ? {
              id: event.venue.id,
              name: event.venue.name,
              city: event.venue.city,
              slug: event.venue.slug,
            }
          : null,
        createdAt: event.createdAt,
      })),
      total,
      hasMore: offset + limit < total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('[API] Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
