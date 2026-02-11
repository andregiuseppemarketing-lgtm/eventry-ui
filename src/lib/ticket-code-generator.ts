import { prisma } from './prisma';

/**
 * Generates a readable ticket code in the format: VENUECODE-DDMMYY-NNN
 * Example: PANICO-141124-001, GATSBY-250625-042
 * 
 * @param eventId - The event ID to generate the code for
 * @returns A unique ticket code
 */
export async function generateTicketCode(eventId: string): Promise<string> {
  // 1. Get event and venue info
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      venue: {
        select: { name: true }
      }
    }
  });

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  // 2. Generate venue prefix (first word or max 8 chars, uppercase, alphanumeric only)
  const venuePrefix = event.venue.name
    .split(' ')[0]
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);

  // 3. Generate date part (DDMMYY)
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).substring(2); // Last 2 digits
  const datePart = `${day}${month}${year}`;

  // 4. Get sequential number for today
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const todayTicketsCount = await prisma.ticket.count({
    where: {
      eventId,
      issuedAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const sequenceNumber = String(todayTicketsCount + 1).padStart(3, '0');

  // 5. Combine all parts
  const ticketCode = `${venuePrefix}-${datePart}-${sequenceNumber}`;

  // 6. Verify uniqueness (safety check)
  const existing = await prisma.ticket.findUnique({
    where: { code: ticketCode },
  });

  if (existing) {
    // If somehow exists, add random suffix
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${ticketCode}-${randomSuffix}`;
  }

  return ticketCode;
}

/**
 * Batch generate ticket codes for multiple tickets
 * More efficient than calling generateTicketCode multiple times
 */
export async function generateTicketCodes(
  eventId: string,
  count: number
): Promise<string[]> {
  // Get event and venue info
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      venue: {
        select: { name: true }
      }
    }
  });

  if (!event) {
    throw new Error(`Event ${eventId} not found`);
  }

  const venuePrefix = event.venue.name
    .split(' ')[0]
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8);

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).substring(2);
  const datePart = `${day}${month}${year}`;

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const todayTicketsCount = await prisma.ticket.count({
    where: {
      eventId,
      issuedAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const sequenceNumber = String(todayTicketsCount + i + 1).padStart(3, '0');
    codes.push(`${venuePrefix}-${datePart}-${sequenceNumber}`);
  }

  return codes;
}
