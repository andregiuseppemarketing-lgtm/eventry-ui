/**
 * MILESTONE 7 - Admin API: Events List
 * GET /api/admin/events - Lista eventi con filtri
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
    const search = searchParams.get('search') || '';
    const statusFilter = searchParams.get('status') || 'ALL';
    const typeFilter = searchParams.get('type') || 'ALL';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    if (typeFilter !== 'ALL') {
      where.ticketType = typeFilter;
    }

    const events = await prisma.event.findMany({
      where,
      take: 100,
      orderBy: { dateStart: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        ticketType: true,
        dateStart: true,
        maxGuests: true,
        createdBy: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Admin events list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
