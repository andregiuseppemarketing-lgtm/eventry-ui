/**
 * MILESTONE 7 - Admin API: Search Ticket
 * GET /api/admin/tickets/search
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // ⚠️ SECURITY: Solo ADMIN
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const qr = searchParams.get('qr');
    const email = searchParams.get('email');
    const eventId = searchParams.get('event');

    let ticket = null;

    if (qr) {
      // Search by QR code
      ticket = await prisma.ticket.findFirst({
        where: { code: qr },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              dateStart: true,
            },
          },
          checkins: {
            take: 1,
            orderBy: { scannedAt: 'desc' },
            select: { scannedAt: true },
          },
        },
      });
    } else if (email) {
      // Search by owner email
      ticket = await prisma.ticket.findFirst({
        where: {
          user: {
            email: { equals: email, mode: 'insensitive' },
          },
        },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              dateStart: true,
            },
          },
          checkins: {
            take: 1,
            orderBy: { scannedAt: 'desc' },
            select: { scannedAt: true },
          },
        },
      });
    } else if (eventId) {
      // Search by event ID (returns first ticket)
      ticket = await prisma.ticket.findFirst({
        where: { eventId },
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          event: {
            select: {
              id: true,
              title: true,
              dateStart: true,
            },
          },
          checkins: {
            take: 1,
            orderBy: { scannedAt: 'desc' },
            select: { scannedAt: true },
          },
        },
      });
    }

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Admin ticket search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
