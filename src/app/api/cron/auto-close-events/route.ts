import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/auto-close-events
 * Chiude automaticamente eventi PUBLISHED che risultano scaduti
 * 
 * Setup Vercel Cron:
 * vercel.json crons array con schedule ogni 6 ore
 * 
 * Criterio scadenza:
 * - Se dateEnd presente: chiude se dateEnd passata
 * - Se dateEnd assente: chiude se dateStart + 6 ore passato
 */
export async function POST(req: NextRequest) {
  try {
    // Auth cron via secret
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // Query eventi PUBLISHED scaduti (batch limit 100)
    const expiredEvents = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          // Caso 1: dateEnd esiste ed è passata
          {
            dateEnd: {
              not: null,
              lt: now,
            },
          },
          // Caso 2: dateEnd null, dateStart + 6h passato
          {
            dateEnd: null,
            dateStart: {
              lt: sixHoursAgo,
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        dateStart: true,
        dateEnd: true,
        status: true,
      },
      take: 100,
    });

    let closedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Chiudi eventi scaduti
    for (const event of expiredEvents) {
      try {
        await prisma.event.update({
          where: { id: event.id },
          data: { status: 'CLOSED' },
        });
        closedCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Event ${event.id}: ${err instanceof Error ? err.message : 'unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      scanned: expiredEvents.length,
      closed: closedCount,
      errors: errorCount,
      errorDetails: errorCount > 0 ? errors : undefined,
    });

  } catch (err) {
    console.error('[CRON] auto-close-events error:', err);
    return NextResponse.json(
      { 
        error: 'Errore interno durante auto-close',
        details: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 }
    );
  }
}
