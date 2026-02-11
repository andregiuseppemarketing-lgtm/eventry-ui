import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CheckInScanSchema } from '@/lib/validations';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  checkRateLimit,
  createAuditLog 
} from '@/lib/api';

/**
 * POST /api/checkin/scan
 * Scan and validate ticket for check-in
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['STAFF', 'ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    // Rate limiting for security
    const clientId = user.id;
    if (!checkRateLimit(`checkin:${clientId}`, 30, 60000)) { // 30 scans per minute
      return ApiErrors.badRequest('Rate limit exceeded. Please wait before scanning again.');
    }

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
            dateEnd: true,
            status: true,
          },
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
            plusOne: true,
          },
        },
        checkins: {
          orderBy: { scannedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return createApiResponse(
        { 
          success: false, 
          message: 'Ticket non trovato',
          code,
        },
        undefined,
        200
      );
    }

    // Check if ticket is already used (idempotency)
    if (ticket.status === 'USED' && ticket.checkins.length > 0) {
      const lastCheckin = ticket.checkins[0];
      return createApiResponse({
        success: false,
        message: 'Ticket già utilizzato',
        ticket: {
          id: ticket.id,
          code: ticket.code,
          type: ticket.type,
          event: ticket.event,
          holder: ticket.user || ticket.listEntry,
          alreadyScanned: true,
          lastScanTime: lastCheckin.scannedAt,
        },
      });
    }

    // Check if ticket is cancelled
    if (ticket.status === 'CANCELLED') {
      return createApiResponse({
        success: false,
        message: 'Ticket annullato',
        code,
      });
    }

    // Check event status
    if (ticket.event.status === 'CLOSED') {
      return createApiResponse({
        success: false,
        message: 'Evento non più attivo',
        code,
      });
    }

    // Check event timing (optional - can be disabled for testing)
    const now = new Date();
    const eventStart = new Date(ticket.event.dateStart);
    const eventEnd = ticket.event.dateEnd ? new Date(ticket.event.dateEnd) : null;
    
    // Allow check-in 2 hours before event start
    const checkInStart = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000);
    
    if (now < checkInStart) {
      return createApiResponse({
        success: false,
        message: 'Check-in non ancora aperto per questo evento',
        code,
      });
    }

    if (eventEnd && now > eventEnd) {
      return createApiResponse({
        success: false,
        message: 'Evento terminato',
        code,
      });
    }

    // Create check-in record
    const checkin = await prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        scannedByUserId: user.id,
        gate,
        notes,
        ok: true,
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
      'checkin.scan',
      'Ticket',
      ticket.id,
      { 
        code: ticket.code, 
        gate, 
        eventId: ticket.event.id,
        success: true 
      }
    );

    return createApiResponse({
      success: true,
      message: 'Check-in completato con successo',
      ticket: {
        id: ticket.id,
        code: ticket.code,
        type: ticket.type,
        event: ticket.event,
        holder: ticket.user || ticket.listEntry,
        checkinTime: checkin.scannedAt,
        gate: checkin.gate,
      },
    });

  } catch (error) {
    console.error('Check-in scan error:', error);
    return ApiErrors.internal('Errore durante la scansione');
  }
}