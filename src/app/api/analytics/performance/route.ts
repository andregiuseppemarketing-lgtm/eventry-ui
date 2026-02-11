import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const metric = await req.json();

    // Log in console per ora (in futuro salvare in DB o analytics service)
    console.log('[Performance Metric]', {
      name: metric.name,
      value: `${metric.value}ms`,
      rating: metric.rating,
      timestamp: new Date(metric.timestamp).toISOString(),
    });

    // Se metric è POOR, potremmo salvare in DB per analisi
    if (metric.rating === 'poor') {
      // TODO: salvare in tabella PerformanceMetrics per analisi
      console.warn('[POOR PERFORMANCE]', metric);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Performance API] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export const runtime = 'nodejs';
