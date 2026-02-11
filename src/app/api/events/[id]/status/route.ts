import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
      case 'unpublish':
      case 'draft':
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
