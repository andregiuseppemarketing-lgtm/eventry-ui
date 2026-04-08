import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * EVENT STATE MACHINE
 * 
 * Valid transitions:
 * - DRAFT → PUBLISHED
 * - DRAFT → CANCELLED
 * - PUBLISHED → CLOSED
 * - PUBLISHED → CANCELLED
 * - CANCELLED → (terminal, no transitions)
 * - CLOSED → (terminal, no transitions)
 */

type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'CLOSED';

/**
 * Validates if a state transition is allowed
 * @param from - Current event status
 * @param to - Requested event status
 * @returns true if transition is valid, false otherwise
 */
function isValidTransition(from: EventStatus, to: EventStatus): boolean {
  // No-op: same state is allowed (idempotent)
  if (from === to) {
    return true;
  }

  // Terminal states: no transitions allowed
  if (from === 'CANCELLED' || from === 'CLOSED') {
    return false;
  }

  // Define allowed transitions
  const allowedTransitions: Record<EventStatus, EventStatus[]> = {
    'DRAFT': ['PUBLISHED', 'CANCELLED'],
    'PUBLISHED': ['CLOSED', 'CANCELLED'],
    'CANCELLED': [], // Terminal state
    'CLOSED': [],    // Terminal state
  };

  return allowedTransitions[from].includes(to);
}

/**
 * PATCH /api/events/[id]/status
 * Aggiorna lo stato di un evento
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;
    const { status, action } = await req.json();

    // Verifica permessi
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdByUserId: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      );
    }

    // Solo ADMIN o il creatore possono modificare lo stato
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = event.createdByUserId === session.user.id;
    const isOrganizer = session.user.role === 'ORGANIZER';

    if (!isAdmin && !isOwner && !isOrganizer) {
      return NextResponse.json(
        { error: 'Non hai i permessi per modificare questo evento' },
        { status: 403 }
      );
    }

    let newStatus: string;

    // Determina il nuovo stato in base all'azione
    switch (action) {
      case 'publish':
        newStatus = 'PUBLISHED';
        break;
      case 'draft':
        // Only DRAFT is valid as draft (no unpublishing)
        newStatus = 'DRAFT';
        break;
      case 'cancel':
        newStatus = 'CANCELLED';
        break;
      case 'close':
        newStatus = 'CLOSED';
        break;
      default:
        if (status) {
          newStatus = status;
        } else {
          return NextResponse.json(
            { error: 'Azione o stato non valido' },
            { status: 400 }
          );
        }
    }

    // Valida lo stato
    const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'CLOSED'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'Stato non valido' },
        { status: 400 }
      );
    }

    // STATE MACHINE: Validate transition
    const currentStatus = event.status as EventStatus;
    const requestedStatus = newStatus as EventStatus;

    if (!isValidTransition(currentStatus, requestedStatus)) {
      return NextResponse.json(
        {
          error: 'Transizione non consentita',
          message: `Non è possibile passare da ${currentStatus} a ${requestedStatus}`,
          from: currentStatus,
          to: requestedStatus,
          allowedTransitions: currentStatus === 'CANCELLED' || currentStatus === 'CLOSED'
            ? []
            : currentStatus === 'DRAFT'
            ? ['PUBLISHED', 'CANCELLED']
            : ['CLOSED', 'CANCELLED'],
        },
        { status: 400 }
      );
    }

    // M11: Pre-publish validation
    // Only validate when transitioning TO published (not when already published)
    if (newStatus === 'PUBLISHED' && event.status !== 'PUBLISHED') {
      // Fetch full event for validation
      const fullEvent = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          venue: true,
          lists: { select: { id: true } },
          _count: { select: { tickets: true } },
        },
      });

      if (!fullEvent) {
        return NextResponse.json(
          { error: 'Evento non trovato' },
          { status: 404 }
        );
      }

      // Validation checks
      const issues: string[] = [];

      // Title check
      if (!fullEvent.title || fullEvent.title.trim().length < 5) {
        issues.push('Il titolo deve essere di almeno 5 caratteri');
      }

      // Description check
      if (!fullEvent.description || fullEvent.description.trim().length < 20) {
        issues.push('La descrizione deve essere di almeno 20 caratteri');
      }

      // Cover image check
      if (!fullEvent.coverUrl || fullEvent.coverUrl.trim().length === 0) {
        issues.push('La locandina è obbligatoria');
      }

      // Venue check
      if (!fullEvent.venue) {
        issues.push('La location è obbligatoria');
      }

      // Date check
      const eventDate = new Date(fullEvent.dateStart);
      if (eventDate <= new Date()) {
        issues.push('La data dell\'evento deve essere nel futuro');
      }

      // If validation fails, block publish
      if (issues.length > 0) {
        return NextResponse.json(
          {
            error: 'Evento incompleto. Completa i campi obbligatori prima di pubblicare.',
            issues,
          },
          { status: 400 }
        );
      }
    }

    // Aggiorna lo stato
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { status: newStatus as any },
      select: {
        id: true,
        title: true,
        status: true,
        dateStart: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Evento ${action === 'publish' ? 'pubblicato' : action === 'cancel' ? 'annullato' : action === 'draft' ? 'nascosto' : 'aggiornato'} con successo`,
      event: updatedEvent,
    });

  } catch (error) {
    console.error('Errore aggiornamento stato evento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/events/[id]/status
 * Elimina definitivamente un evento
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Verifica permessi
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        createdByUserId: true,
        _count: {
          select: {
            tickets: true,
            lists: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      );
    }

    // Solo ADMIN o il creatore possono eliminare
    const isAdmin = session.user.role === 'ADMIN';
    const isOwner = event.createdByUserId === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Non hai i permessi per eliminare questo evento' },
        { status: 403 }
      );
    }

    // Verifica se ci sono ticket o liste associate
    if (event._count.tickets > 0 || event._count.lists > 0) {
      return NextResponse.json(
        { 
          error: 'Impossibile eliminare l\'evento',
          message: `L'evento ha ${event._count.tickets} ticket e ${event._count.lists} liste associate. Annulla l'evento invece di eliminarlo.`,
          canDelete: false,
        },
        { status: 400 }
      );
    }

    // Elimina l'evento (cascade eliminerà anche le relazioni)
    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({
      success: true,
      message: `Evento "${event.title}" eliminato con successo`,
    });

  } catch (error) {
    console.error('Errore eliminazione evento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
