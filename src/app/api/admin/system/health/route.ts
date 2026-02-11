/**
 * MILESTONE 7 - Admin API: System Health
 * GET /api/admin/system/health
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

    // Check environment variables
    const environment = {
      DATABASE_URL: !!process.env.POSTGRES_URL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    };

    // Get versions
    const versions = {
      nextjs: '16.0.7',
      prisma: '6.19.0',
      node: process.version,
    };

    // Check database connection and get stats
    let database = {
      connected: false,
      userCount: 0,
      eventCount: 0,
      ticketCount: 0,
    };

    try {
      const [userCount, eventCount, ticketCount] = await Promise.all([
        prisma.user.count(),
        prisma.event.count(),
        prisma.ticket.count(),
      ]);

      database = {
        connected: true,
        userCount,
        eventCount,
        ticketCount,
      };
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Get recent errors (if you have error logging)
    const lastErrors: Array<{ message: string; timestamp: Date }> = [];
    // TODO: Implement error logging system if needed

    return NextResponse.json({
      environment,
      versions,
      database,
      lastErrors,
    });
  } catch (error) {
    console.error('System health check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
