import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IssueTicketSchema } from '@/lib/validations';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  createAuditLog 
} from '@/lib/api';
import { sendMessage, sendPhoto, MessageTemplates, getActiveProviders } from '@/lib/messaging';
import QRCode from 'qrcode';
import { rateLimitOr429, getClientIp } from '@/lib/ratelimit';
import { ActorType } from '@prisma/client';
import { 
  checkComplimentaryQuota, 
  consumeComplimentaryPass
} from '@/lib/complimentary-service';

/**
 * POST /api/tickets/issue
 * Issue a new ticket
 * Richiede: Identity verified per acquisto ticket
 * 
 * Rate Limit: 60 tickets per hour per user
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['PR', 'ORGANIZER', 'ADMIN', 'STAFF']);
  if (authError) return authError;

  // Rate limiting: 60 ticket issues per hour per user
  const rateLimitResult = await rateLimitOr429(req, {
    key: 'ticket-issue',
    identifier: user!.id,
    limit: 60,
    window: '1h',
  });

  if (!rateLimitResult.ok) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    
    const { data: validatedData, error } = validateInput(IssueTicketSchema, body);
    if (error) return error;

    const { listEntryId, userId, type, price, currency } = validatedData!;

    // Check identity verification for paid tickets
    if (type === 'PAID' && !user!.identityVerified) {
      return createApiResponse(
        undefined,
        'Devi verificare la tua identità per acquistare biglietti',
        403
      );
    }

    // Validate required references
    let eventId: string;
    let listEntry = null;
    let targetUser = null;

    if (listEntryId) {
      listEntry = await prisma.listEntry.findUnique({
        where: { id: listEntryId },
        include: {
          list: {
            include: { event: true },
          },
        },
      });

      if (!listEntry) {
        return ApiErrors.notFound('List entry');
      }

      if (listEntry.status !== 'CONFIRMED') {
        return ApiErrors.badRequest('List entry must be confirmed before issuing ticket');
      }

      eventId = listEntry.list.event.id;
    } else if (userId) {
      targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return ApiErrors.notFound('User');
      }

      // For user tickets, we need eventId from request body
      if (!body.eventId) {
        return ApiErrors.badRequest('Event ID is required for user tickets');
      }
      eventId = body.eventId;
    } else {
      return ApiErrors.badRequest('Either listEntryId or userId is required');
    }

    // Check if ticket already exists
    const existingTicket = await prisma.ticket.findFirst({
      where: {
        eventId,
        ...(listEntryId ? { listEntryId } : { userId }),
        status: { not: 'CANCELLED' },
      },
    });

    if (existingTicket) {
      return ApiErrors.badRequest('Ticket already exists for this entry/user');
    }

    // Gestione biglietti omaggio con validazione quota
    const isComplimentary = body.isComplimentary === true;
    const complimentaryReason = body.complimentaryReason || null;
    let complimentaryGrantedBy = null;
    let actorType: ActorType | null = null;
    let actorId: string | null = null;

    if (isComplimentary) {
      // Determina l'actor type in base al ruolo e proprietà evento
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { createdByUserId: true, venueId: true },
      });

      if (!event) {
        return ApiErrors.notFound('Event');
      }

      // Determina actorType e actorId
      if (event.createdByUserId === user.id || user.role === 'ADMIN' || user.role === 'ORGANIZER') {
        actorType = 'ORGANIZATION';
        actorId = eventId; // ORGANIZATION quota is per-event
      } else if (user.role === 'VENUE') {
        if (!event.venueId) {
          return createApiResponse(
            undefined,
            'Impossibile assegnare biglietti omaggio: evento non associato a nessun locale',
            400
          );
        }
        actorType = 'VENUE';
        actorId = event.venueId; // VENUE quota uses venueId
      } else if (user.role === 'PR') {
        actorType = 'PR';
        actorId = user.id; // PR quota is per-user
      } else {
        return createApiResponse(
          undefined,
          'Non hai il permesso di assegnare biglietti omaggio',
          403
        );
      }

      // Verifica quota disponibile PRIMA di creare il ticket
      try {
        const quotaCheck = await checkComplimentaryQuota(
          eventId,
          actorType,
          actorId
        );
        
        if (!quotaCheck.available) {
          return createApiResponse(
            undefined,
            `Quota biglietti omaggio esaurita. Hai utilizzato ${quotaCheck.max - quotaCheck.remaining}/${quotaCheck.max} biglietti disponibili.`,
            400
          );
        }

        complimentaryGrantedBy = user.id;
      } catch (error) {
        console.error('Errore verifica quota complimentary:', error);
        return createApiResponse(
          undefined,
          error instanceof Error ? error.message : 'Errore verifica quota complimentary',
          400
        );
      }
    }

    // Generate unique ticket code
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const ticketCode = `${type}-${timestamp}-${random}`;

    // Create QR data
    const qrData = JSON.stringify({
      ticketId: ticketCode,
      eventId,
      type,
      issuedAt: new Date().toISOString(),
      holder: listEntry ? 
        `${listEntry.firstName} ${listEntry.lastName}` :
        targetUser?.name || 'Unknown',
    });

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        eventId,
        listEntryId,
        userId,
        issuedByUserId: user.id,
        type,
        price: isComplimentary ? 0 : price,
        currency,
        code: ticketCode,
        qrData,
        status: 'NEW',
        paid: isComplimentary || type !== 'PAID',
        complimentarySource: isComplimentary ? 'MANUAL' : null,
        // complimentaryQuotaId will be set by consumeComplimentaryPass
      },
      include: {
        event: {
          select: { id: true, title: true, dateStart: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
        listEntry: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        issuedBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Consuma quota complimentary se necessario (transazione atomica)
    if (isComplimentary && complimentaryGrantedBy && actorType && actorId) {
      try {
        // Determina assignedToId: userId from body, or guestId from listEntry, or undefined
        const assignedToId = userId || listEntry?.guestId || undefined;
        const guestName = listEntry 
          ? `${listEntry.firstName} ${listEntry.lastName}` 
          : targetUser?.name || undefined;
        
        await consumeComplimentaryPass(
          eventId,
          ticket.id,
          actorType,
          actorId,
          user.id,
          assignedToId,
          complimentaryReason || undefined,
          guestName
        );
      } catch (quotaError) {
        console.error('Errore consumo quota complimentary:', quotaError);
        // Annulla il ticket se la quota fallisce
        await prisma.ticket.delete({ where: { id: ticket.id } });
        return createApiResponse(
          undefined,
          quotaError instanceof Error 
            ? quotaError.message 
            : 'Errore durante il consumo della quota complimentary',
          500
        );
      }
    }

    // Audit log
    await createAuditLog(
      user.id,
      'ticket.issue',
      'Ticket',
      ticket.id,
      { 
        code: ticket.code,
        type: ticket.type,
        eventId,
        holder: ticket.user?.name || 
          `${ticket.listEntry?.firstName} ${ticket.listEntry?.lastName}` 
      }
    );

    // 🔔 INVIO NOTIFICA TELEGRAM (se il guest ha collegato Telegram)
    try {
      // Recupera guest con telegramChatId
      const guest: any = await prisma.guest.findFirst({
        where: {
          OR: [
            { listEntries: { some: { id: ticket.listEntryId || undefined } } },
            { email: ticket.listEntry?.email || undefined },
          ],
        },
        select: { id: true, telegramChatId: true, firstName: true, lastName: true },
      } as any);

      if (guest?.telegramChatId) {
        const activeProviders = getActiveProviders();
        
        if (activeProviders.includes('telegram')) {
          // Formatta data evento
          const eventDate = new Date(ticket.event.dateStart).toLocaleDateString('it-IT', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          // Invia messaggio di conferma
          const messageResult = await sendMessage({
            to: guest.telegramChatId,
            message: MessageTemplates.ticketConfirmed(
              ticket.event.title,
              eventDate,
              ticket.code
            ),
          });

          // Genera e invia QR code
          if (messageResult.success) {
            const qrCodeBuffer = await QRCode.toBuffer(ticket.qrData, {
              errorCorrectionLevel: 'H',
              margin: 2,
              width: 512,
            });

            await sendPhoto({
              to: guest.telegramChatId,
              media: qrCodeBuffer,
              message: `🎟️ Biglietto: ${ticket.code}\n📱 Mostra questo QR code all'ingresso`,
            });

            console.log(`✅ Notifica Telegram inviata a guest ${guest.id} (${guest.firstName} ${guest.lastName})`);
          }
        }
      }
    } catch (telegramError) {
      // Non bloccare l'emissione del biglietto se Telegram fallisce
      console.error('⚠️ Errore invio notifica Telegram:', telegramError);
    }

    return createApiResponse(ticket, undefined, 201);

  } catch (error) {
    console.error('Ticket issue error:', error);
    return ApiErrors.internal('Failed to issue ticket');
  }
}