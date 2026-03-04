import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  arriveTicket,
  markTicketPaid,
  admitTicket,
  rejectTicket,
  ScanAction,
} from '@/lib/ticket-state-machine';
import { Gate, PaymentMethod } from '@prisma/client';

/**
 * POST /api/tickets/scan
 * 
 * Gestisce scansione ticket con state machine (ARRIVE/MARK_PAID/ADMIT/REJECT)
 * 
 * Body: {
 *   ticketCode: string;
 *   action: 'ARRIVE' | 'MARK_PAID' | 'ADMIT' | 'REJECT';
 *   gate?: 'MAIN' | 'VIP' | 'STAFF' | 'EMERGENCY';
 *   paymentMethod?: 'CASH' | 'CARD_DOOR' | 'SATISPAY';  // Solo per MARK_PAID
 *   amount?: number;                                      // Solo per MARK_PAID
 *   reason?: string;                                      // Solo per REJECT
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { ticketCode, action, gate, paymentMethod, amount, reason } = body;

    // Validazione
    if (!ticketCode) {
      return NextResponse.json(
        { error: 'ticketCode is required' },
        { status: 400 }
      );
    }

    if (!action || !['ARRIVE', 'MARK_PAID', 'ADMIT', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: ARRIVE, MARK_PAID, ADMIT, REJECT' },
        { status: 400 }
      );
    }

    // Esegui azione richiesta
    let result;

    switch (action as ScanAction) {
      case 'ARRIVE':
        result = await arriveTicket({
          ticketCode,
          userId: session.user.id,
          gate: gate as Gate,
        });
        break;

      case 'MARK_PAID':
        if (!paymentMethod) {
          return NextResponse.json(
            { error: 'paymentMethod is required for MARK_PAID action' },
            { status: 400 }
          );
        }

        result = await markTicketPaid({
          ticketCode,
          userId: session.user.id,
          amount,
          paymentMethod: paymentMethod as PaymentMethod,
          gate: gate as Gate,
        });
        break;

      case 'ADMIT':
        result = await admitTicket({
          ticketCode,
          userId: session.user.id,
          gate: gate as Gate,
        });
        break;

      case 'REJECT':
        result = await rejectTicket({
          ticketCode,
          userId: session.user.id,
          reason,
        });
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        );
    }

    // Ritorna risultato
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'OPERATION_FAILED',
          message: result.message,
          ticket: result.ticket,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      ticket: result.ticket,
      transition: {
        from: result.previousStatus,
        to: result.newStatus,
        action,
      },
    });
  } catch (error) {
    console.error('Error scanning ticket:', error);

    return NextResponse.json(
      { error: 'Failed to process scan' },
      { status: 500 }
    );
  }
}
