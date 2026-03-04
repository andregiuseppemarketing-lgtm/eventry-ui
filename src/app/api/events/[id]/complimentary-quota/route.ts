import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getEventComplimentaryQuotas, updateEventComplimentaryQuotas } from '@/lib/complimentary-service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/events/[id]/complimentary-quota
 * Ottiene le quote di biglietti omaggio per un evento
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Verifica che l'utente abbia accesso all'evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdByUserId: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Solo organizer o admin possono vedere le quote
    if (
      event.createdByUserId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const quotas = await getEventComplimentaryQuotas(eventId);

    return NextResponse.json(quotas);
  } catch (error) {
    console.error('Error fetching complimentary quotas:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[id]/complimentary-quota
 * Aggiorna le quote di biglietti omaggio per un evento
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Verifica che l'utente sia organizer o admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdByUserId: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (
      event.createdByUserId !== session.user.id &&
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { organizerQuota, prQuotas } = body;

    // Validazione
    if (typeof organizerQuota !== 'number' || organizerQuota < 0) {
      return NextResponse.json(
        { error: 'Invalid organizer quota' },
        { status: 400 }
      );
    }

    if (!Array.isArray(prQuotas)) {
      return NextResponse.json(
        { error: 'Invalid PR quotas format' },
        { status: 400 }
      );
    }

    // Valida ogni quota PR
    for (const prQuota of prQuotas) {
      if (
        !prQuota.prUserId ||
        typeof prQuota.maxFreePasses !== 'number' ||
        prQuota.maxFreePasses < 0
      ) {
        return NextResponse.json(
          { error: 'Invalid PR quota data' },
          { status: 400 }
        );
      }
    }

    await updateEventComplimentaryQuotas(
      eventId, 
      organizerQuota, 
      prQuotas,
      session.user.id // changedBy for audit log
    );

    // Ritorna le quote aggiornate
    const updatedQuotas = await getEventComplimentaryQuotas(eventId);

    return NextResponse.json(updatedQuotas);
  } catch (error) {
    console.error('Error updating complimentary quotas:', error);
    
    // Se è un errore di validazione (total < used), ritorna 400 con messaggio chiaro
    if (error instanceof Error && error.message.includes('Impossibile impostare quota')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
