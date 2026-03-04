import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPRComplimentaryQuota } from '@/lib/complimentary-service';

/**
 * GET /api/pr/[prId]/complimentary-quota
 * Ottiene tutte le quote di biglietti omaggio per un PR (attraverso tutti gli eventi)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ prId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prId: prUserId } = await params;

    // Verifica che l'utente acceda solo ai propri dati o sia admin
    if (session.user.id !== prUserId && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Ottiene l'eventId dalla query string se fornito
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (eventId) {
      // Quota per un singolo evento
      const quota = await getPRComplimentaryQuota(eventId, prUserId);
      return NextResponse.json(quota);
    } else {
      // Tutte le quote del PR attraverso il sistema unificato EventQuota
      const { prisma } = await import('@/lib/prisma');
      const quotas = await prisma.eventQuota.findMany({
        where: { 
          actorType: 'PR',
          actorId: prUserId 
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

      return NextResponse.json(
        quotas.map((q) => ({
          eventId: q.eventId,
          eventTitle: q.event.title,
          eventDate: q.event.dateStart,
          eventStatus: q.event.status,
          max: q.total,
          used: q.used,
          available: q.available,
        }))
      );
    }
  } catch (error) {
    console.error('Error fetching PR complimentary quota:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
