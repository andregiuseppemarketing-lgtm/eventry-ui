import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TicketStatus } from '@prisma/client';

/**
 * POST /api/tickets/[code]/mark-paid
 * Marca un biglietto come pagato alla cassa (door payment)
 * Solo per staff autorizzato (STAFF, SECURITY, ADMIN)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verifica ruolo autorizzato
    const allowedRoles = ['STAFF', 'SECURITY', 'ADMIN'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Forbidden - solo staff autorizzato' },
        { status: 403 }
      );
    }

    const { code: ticketCode } = await params;
    const body = await request.json();
    const { paymentMethod = 'CASH', amount } = body;

    // Trova il biglietto
    const ticket = await prisma.ticket.findUnique({
      where: { code: ticketCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            ticketPrice: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: 'Biglietto non trovato' },
        { status: 404 }
      );
    }

    // Verifica che sia DOOR_ONLY
    if (ticket.type !== 'DOOR_ONLY') {
      return NextResponse.json(
        { error: 'Questo biglietto non richiede pagamento alla porta' },
        { status: 400 }
      );
    }

    // Verifica che non sia già pagato
    if (ticket.paid) {
      return NextResponse.json(
        { error: 'Biglietto già pagato' },
        { status: 400 }
      );
    }

    // Verifica che non sia omaggio
    if (ticket.complimentarySource) {
      return NextResponse.json(
        { error: 'I biglietti omaggio non richiedono pagamento' },
        { status: 400 }
      );
    }

    // Verifica che non sia già stato usato
    if (
      ticket.status === TicketStatus.CHECKED_IN ||
      ticket.status === TicketStatus.USED
    ) {
      return NextResponse.json(
        { error: 'Biglietto già utilizzato - impossibile modificare pagamento' },
        { status: 400 }
      );
    }

    // Calcola l'importo da pagare
    const expectedAmount = amount || ticket.price || ticket.event.ticketPrice || 0;

    // Aggiorna il biglietto
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        paid: true,
        paymentStatus: 'PAID',
        price: expectedAmount,
        updatedAt: new Date(),
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log vendita (opzionale - può essere esteso)
    console.log('[PAYMENT] Door payment recorded:', {
      ticketId: ticket.id,
      ticketCode: ticket.code,
      amount: expectedAmount,
      method: paymentMethod,
      cashierId: session.user.id,
      cashierName: session.user.name,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Pagamento di €${expectedAmount.toFixed(2)} registrato con successo`,
      ticket: {
        id: updatedTicket.id,
        code: updatedTicket.code,
        status: updatedTicket.status,
        paid: updatedTicket.paid,
        paymentStatus: updatedTicket.paymentStatus,
        price: updatedTicket.price,
        currency: updatedTicket.currency,
        event: updatedTicket.event,
        user: updatedTicket.user,
      },
      payment: {
        method: paymentMethod,
        amount: expectedAmount,
        currency: ticket.currency || 'EUR',
        processedBy: {
          id: session.user.id,
          name: session.user.name,
        },
        processedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error marking ticket as paid:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
