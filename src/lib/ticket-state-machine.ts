import { prisma } from './prisma';
import { TicketStatus, PaymentStatus, PaymentMethod, Gate } from '@prisma/client';

/**
 * Service per gestione state machine dei ticket
 */

export type ScanAction = 'ARRIVE' | 'MARK_PAID' | 'ADMIT' | 'REJECT';

export interface ScanResult {
  success: boolean;
  ticket: unknown;
  message: string;
  previousStatus?: TicketStatus;
  newStatus?: TicketStatus;
  error?: string;
}

/**
 * Valida transizione ARRIVE
 */
function canArrive(status: TicketStatus): boolean {
  return ['NEW', 'REGISTERED', 'PENDING'].includes(status);
}

/**
 * Valida transizione MARK_PAID
 */
function canMarkPaid(
  status: TicketStatus,
  paymentStatus: PaymentStatus | null,
  paymentRequired: boolean
): { allowed: boolean; reason?: string } {
  if (!paymentRequired) {
    return { allowed: false, reason: 'Ticket does not require payment' };
  }

  if (status !== 'ARRIVED') {
    return { allowed: false, reason: 'Ticket must be in ARRIVED status to mark as paid' };
  }

  if (paymentStatus !== 'UNPAID') {
    return { allowed: false, reason: 'Ticket is not in UNPAID status' };
  }

  return { allowed: true };
}

/**
 * Valida transizione ADMIT
 */
function canAdmit(
  status: TicketStatus,
  paymentStatus: PaymentStatus | null,
  paymentRequired: boolean,
  isComplimentary: boolean
): { allowed: boolean; reason?: string } {
  // Status validi per ammissione
  const validStatuses = ['ARRIVED', 'REGISTERED', 'NEW'];
  if (!validStatuses.includes(status)) {
    return {
      allowed: false,
      reason: `Cannot admit ticket with status ${status}. Must be ARRIVED or REGISTERED.`,
    };
  }

  // Se complimentary → passa sempre
  if (isComplimentary) {
    return { allowed: true };
  }

  // Se non richiesto pagamento → passa
  if (!paymentRequired) {
    return { allowed: true };
  }

  // Se richiesto pagamento → deve essere pagato
  const paidStatuses = ['PAID_DOOR', 'PAID_ONLINE', 'NOT_REQUIRED'];
  if (!paymentStatus || !paidStatuses.includes(paymentStatus)) {
    return {
      allowed: false,
      reason: 'Payment required. Ticket must be marked as paid before admission.',
    };
  }

  return { allowed: true };
}

/**
 * ARRIVE: segna arrivo al gate
 */
export async function arriveTicket(params: {
  ticketCode: string;
  userId: string;
  gate?: Gate;
}): Promise<ScanResult> {
  const { ticketCode, userId, gate } = params;

  const ticket = await prisma.ticket.findUnique({
    where: { code: ticketCode },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  if (!ticket) {
    return {
      success: false,
      ticket: null,
      message: 'Ticket not found',
      error: 'NOT_FOUND',
    };
  }

  // Valida transizione
  if (!canArrive(ticket.status)) {
    return {
      success: false,
      ticket,
      message: `Cannot mark arrival: ticket is ${ticket.status}`,
      error: 'INVALID_STATUS',
    };
  }

  // Aggiorna ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: 'ARRIVED',
      arrivedAt: new Date(),
      arrivedByUserId: userId,
      arrivedGate: gate || 'MAIN',
    },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  return {
    success: true,
    ticket: updatedTicket,
    message: 'Ticket marked as arrived',
    previousStatus: ticket.status,
    newStatus: 'ARRIVED',
  };
}

/**
 * MARK_PAID: segna pagamento al botteghino
 */
export async function markTicketPaid(params: {
  ticketCode: string;
  userId: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  gate?: Gate;
}): Promise<ScanResult> {
  const { ticketCode, userId, amount, paymentMethod, gate } = params;

  const ticket = await prisma.ticket.findUnique({
    where: { code: ticketCode },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  if (!ticket) {
    return {
      success: false,
      ticket: null,
      message: 'Ticket not found',
      error: 'NOT_FOUND',
    };
  }

  // Valida transizione
  const validation = canMarkPaid(
    ticket.status,
    ticket.paymentStatus,
    ticket.paymentRequired
  );

  if (!validation.allowed) {
    return {
      success: false,
      ticket,
      message: validation.reason || 'Cannot mark as paid',
      error: 'INVALID_TRANSITION',
    };
  }

  // Aggiorna ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      paid: true,
      paymentStatus: 'PAID_DOOR',
      paymentMethod: paymentMethod || 'CASH',
      paidAt: new Date(),
      paidByUserId: userId,
      paidAmount: amount || ticket.price,
      paidGate: gate || 'MAIN',
    },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  return {
    success: true,
    ticket: updatedTicket,
    message: `Payment recorded: ${paymentMethod || 'CASH'} - €${amount || ticket.price}`,
    previousStatus: ticket.status,
    newStatus: ticket.status,
  };
}

/**
 * ADMIT: ammetti in venue
 */
export async function admitTicket(params: {
  ticketCode: string;
  userId: string;
  gate?: Gate;
}): Promise<ScanResult> {
  const { ticketCode, userId, gate } = params;

  const ticket = await prisma.ticket.findUnique({
    where: { code: ticketCode },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  if (!ticket) {
    return {
      success: false,
      ticket: null,
      message: 'Ticket not found',
      error: 'NOT_FOUND',
    };
  }

  // Valida transizione
  const validation = canAdmit(
    ticket.status,
    ticket.paymentStatus,
    ticket.paymentRequired,
    !!ticket.complimentarySource
  );

  if (!validation.allowed) {
    return {
      success: false,
      ticket,
      message: validation.reason || 'Cannot admit',
      error: 'PAYMENT_REQUIRED',
    };
  }

  // Aggiorna ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: 'ADMITTED',
      admittedAt: new Date(),
      admittedByUserId: userId,
      admittedGate: gate || 'MAIN',
    },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  // Log check-in (backward compatibility)
  await prisma.checkIn.create({
    data: {
      ticketId: ticket.id,
      scannedByUserId: userId,
      gate: gate || 'MAIN',
    },
  });

  return {
    success: true,
    ticket: updatedTicket,
    message: 'Ticket admitted successfully',
    previousStatus: ticket.status,
    newStatus: 'ADMITTED',
  };
}

/**
 * REJECT: rifiuta ingresso
 */
export async function rejectTicket(params: {
  ticketCode: string;
  userId: string;
  reason?: string;
}): Promise<ScanResult> {
  const { ticketCode, reason } = params;

  const ticket = await prisma.ticket.findUnique({
    where: { code: ticketCode },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  if (!ticket) {
    return {
      success: false,
      ticket: null,
      message: 'Ticket not found',
      error: 'NOT_FOUND',
    };
  }

  // Aggiorna ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id: ticket.id },
    data: {
      status: 'REJECTED',
    },
    include: {
      event: { select: { id: true, title: true } },
      user: { select: { id: true, name: true } },
      guest: true,
    },
  });

  return {
    success: true,
    ticket: updatedTicket,
    message: `Ticket rejected${reason ? `: ${reason}` : ''}`,
    previousStatus: ticket.status,
    newStatus: 'REJECTED',
  };
}
