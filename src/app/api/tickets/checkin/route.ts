import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { TicketStatus } from '@prisma/client';
import { rateLimitOr429, getClientIp } from '@/lib/ratelimit';

/**
 * POST /api/tickets/checkin
 * Check-in di un ticket tramite QR code scan
 * 
 * Rate Limit: 60 check-ins per hour per user (scanner)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Rate limiting: 60 check-ins per hour per scanner user
    const rateLimitResult = await rateLimitOr429(req, {
      key: 'ticket-checkin',
      identifier: session.user.id,
      limit: 60,
      window: '1h',
    });

    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const { ticketCode, qrData } = await req.json();

    if (!ticketCode && !qrData) {
      return NextResponse.json(
        { error: 'ticketCode o qrData richiesto' },
        { status: 400 }
      );
    }

    // Parse QR data se fornito
    let parsedQrData: any = null;
    let searchCode = ticketCode;

    if (qrData) {
      try {
        parsedQrData = JSON.parse(qrData);
        searchCode = parsedQrData.ticketId || ticketCode;
      } catch {
        // Se il QR non è JSON, usa direttamente come codice
        searchCode = qrData;
      }
    }

    // Trova il ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { code: searchCode },
          { qrData: qrData || searchCode },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            dateEnd: true,
            status: true,
            venue: { select: { name: true } },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checkins: {
          orderBy: { scannedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: 'Biglietto non trovato',
          message: 'QR code non valido o biglietto inesistente',
        },
        { status: 404 }
      );
    }

    // Verifica stato ticket
    if (ticket.status === 'CANCELLED') {
      return NextResponse.json({
        success: false,
        error: 'Biglietto annullato',
        message: 'Questo biglietto è stato annullato',
        ticket: {
          code: ticket.code,
          status: ticket.status,
          event: ticket.event,
        },
      });
    }

    if (ticket.status === TicketStatus.CHECKED_IN || ticket.status === TicketStatus.USED) {
      const lastCheckin = ticket.checkins[0];
      return NextResponse.json({
        success: false,
        error: 'Biglietto già utilizzato',
        message: `Check-in già effettuato il ${
          lastCheckin
            ? new Date(lastCheckin.scannedAt).toLocaleString('it-IT')
            : 'precedentemente'
        }`,
        ticket: {
          code: ticket.code,
          status: ticket.status,
          event: ticket.event,
          user: ticket.user,
          lastCheckin: lastCheckin || null,
        },
      });
    }

    // Crea check-in record
    const checkin = await prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        scannedByUserId: session.user.id,
        gate: 'MAIN',
        ok: true,
      },
      include: {
        scannedBy: {
          select: { name: true, email: true },
        },
      },
    });

    // Aggiorna stato ticket
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.CHECKED_IN },
    });

    return NextResponse.json({
      success: true,
      message: '✅ Check-in completato con successo!',
      checkin: {
        id: checkin.id,
        scannedAt: checkin.scannedAt,
        gate: checkin.gate,
        scannedBy: checkin.scannedBy,
      },
      ticket: {
        id: ticket.id,
        code: ticket.code,
        status: 'CHECKED_IN',
        event: ticket.event,
        user: ticket.user,
      },
    });
  } catch (error) {
    console.error('[API] Error during check-in:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
