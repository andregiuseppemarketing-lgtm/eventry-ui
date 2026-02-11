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

/**
 * POST /api/tickets/issue
 * Issue a new ticket
 * Richiede: Identity verified per acquisto ticket
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['PR', 'ORGANIZER', 'ADMIN', 'STAFF']);
  if (authError) return authError;

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
        price,
        currency,
        code: ticketCode,
        qrData,
        status: 'NEW',
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