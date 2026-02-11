import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  createApiResponse,
  requireAuth,
  validateInput,
  ApiErrors,
  createAuditLog,
} from '@/lib/api';
import { CheckInScanSchema } from '@/lib/validations';
import { sendMessage, MessageTemplates, getActiveProviders } from '@/lib/messaging';

/**
 * POST /api/check-in/scan
 * Scan and process a ticket check-in
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['STAFF', 'PR', 'ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const body = await req.json();

    const { data: validatedData, error } = validateInput(CheckInScanSchema, body);
    if (error) return error;

    const { code, gate, notes } = validatedData!;

    // Find ticket by code
    const ticket = await prisma.ticket.findUnique({
      where: { code },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            status: true,
          },
        },
        listEntry: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            gender: true,
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
          orderBy: {
            scannedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return ApiErrors.notFound('Biglietto non trovato');
    }

    // Check ticket status
    if (ticket.status === 'CANCELLED') {
      return createApiResponse(
        undefined,
        'Biglietto annullato',
        400
      );
    }

    if (ticket.status === 'USED') {
      const lastCheckIn = ticket.checkins[0];
      return createApiResponse(
        {
          ticket,
          alreadyUsed: true,
          lastCheckIn,
        },
        `Biglietto già utilizzato il ${new Date(lastCheckIn?.scannedAt || '').toLocaleString('it-IT')}`,
        400
      );
    }

    // Check if event is still active
    if (ticket.event.status === 'CLOSED') {
      return createApiResponse(
        undefined,
        'Evento chiuso',
        400
      );
    }

    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        scannedByUserId: user.id,
        gate,
        notes,
      },
    });

    // Update ticket status
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'USED' },
    });

    // Audit log
    await createAuditLog(
      user.id,
      'ticket.check_in',
      'Ticket',
      ticket.id,
      {
        code: ticket.code,
        gate,
        eventId: ticket.event.id,
      }
    );

    // 🔔 INVIO NOTIFICA TELEGRAM (se il guest ha collegato Telegram)
    try {
      // Recupera guest con telegramChatId
      const guest: any = await prisma.guest.findFirst({
        where: {
          OR: [
            { listEntries: { some: { id: ticket.listEntryId || undefined } } },
          ],
        },
        select: { id: true, telegramChatId: true, firstName: true, lastName: true },
      } as any);

      if (guest?.telegramChatId) {
        const activeProviders = getActiveProviders();
        
        if (activeProviders.includes('telegram')) {
          const guestName = `${guest.firstName} ${guest.lastName}`;
          
          await sendMessage({
            to: guest.telegramChatId,
            message: MessageTemplates.checkInSuccess(ticket.event.title, guestName),
          });

          console.log(`✅ Notifica check-in Telegram inviata a guest ${guest.id} (${guestName})`);
        }
      }
    } catch (telegramError) {
      // Non bloccare il check-in se Telegram fallisce
      console.error('⚠️ Errore invio notifica check-in Telegram:', telegramError);
    }

    return createApiResponse({
      checkIn,
      ticket: {
        ...ticket,
        status: 'USED',
      },
    });
  } catch (error) {
    console.error('Check-in scan error:', error);
    return ApiErrors.internal('Failed to process check-in');
  }
}
