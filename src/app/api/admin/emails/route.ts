/**
 * MILESTONE 7 - Admin API: Email Logs
 * GET /api/admin/emails - Lista log email
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
    const statusFilter = searchParams.get('status') || 'ALL';
    const typeFilter = searchParams.get('type') || 'ALL';

    // Build where clause
    const where: any = {};

    if (statusFilter !== 'ALL') {
      where.status = statusFilter;
    }

    if (typeFilter !== 'ALL') {
      where.type = typeFilter;
    }

    const emails = await prisma.emailLog.findMany({
      where,
      take: 100,
      orderBy: { sentAt: 'desc' },
    });

    return NextResponse.json({ emails });
  } catch (error) {
    console.error('Admin email logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
