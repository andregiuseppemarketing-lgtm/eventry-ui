import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/funnel/track - Registra step funnel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      eventId, 
      step, 
      guestEmail, 
      guestPhone, 
      metadata 
    } = body;

    // Validazione
    if (!sessionId || !eventId || !step) {
      return NextResponse.json(
        { error: "Campi obbligatori: sessionId, eventId, step" },
        { status: 400 }
      );
    }

    // Verifica che l'evento esista
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    // Estrai info dalla request
    const userAgent = req.headers.get('user-agent') || undefined;
    const referer = req.headers.get('referer') || undefined;
    const forwardedFor = req.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor 
      ? forwardedFor.split(',')[0].trim() 
      : req.headers.get('x-real-ip') || undefined;

    // Crea tracking
    const tracking = await prisma.funnelTracking.create({
      data: {
        sessionId,
        eventId,
        step,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        metadata: metadata || null,
        userAgent,
        ipAddress,
        referer,
      } as any,
    });

    return NextResponse.json({ 
      success: true,
      tracking: {
        id: tracking.id,
        sessionId: tracking.sessionId,
        step: tracking.step,
        timestamp: tracking.timestamp,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Errore tracking funnel:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// GET /api/funnel/track - Analytics globali funnel
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build where clause
    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (from || to) {
      where.timestamp = {};
      if (from) {
        where.timestamp.gte = new Date(from);
      }
      if (to) {
        where.timestamp.lte = new Date(to);
      }
    }

    // Query tutti i tracking
    const trackings = await prisma.funnelTracking.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: 1000, // Limit per performance
    });

    // Raggruppa per step
    const stepCounts: Record<string, number> = {};
    const sessionsByStep: Record<string, Set<string>> = {};

    trackings.forEach(t => {
      stepCounts[t.step] = (stepCounts[t.step] || 0) + 1;
      
      if (!sessionsByStep[t.step]) {
        sessionsByStep[t.step] = new Set();
      }
      sessionsByStep[t.step].add(t.sessionId);
    });

    // Calcola conversion rates
    const steps = ['view', 'click', 'form_start', 'form_complete', 'ticket_issued'];
    const funnel = steps.map((step, index) => {
      const count = sessionsByStep[step]?.size || 0;
      const previousStep = index > 0 ? steps[index - 1] : null;
      const previousCount = previousStep ? sessionsByStep[previousStep]?.size || 0 : count;
      
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
      const dropOffRate = 100 - conversionRate;

      return {
        step,
        uniqueSessions: count,
        totalEvents: stepCounts[step] || 0,
        conversionRate: index === 0 ? 100 : conversionRate,
        dropOffRate: index === 0 ? 0 : dropOffRate,
      };
    });

    // Overall conversion (view → ticket_issued)
    const viewSessions = sessionsByStep['view']?.size || 0;
    const ticketSessions = sessionsByStep['ticket_issued']?.size || 0;
    const overallConversion = viewSessions > 0 ? (ticketSessions / viewSessions) * 100 : 0;

    // Sessions abbandonati (hanno fatto almeno 1 step ma non ticket_issued)
    const allSessions = new Set<string>();
    trackings.forEach(t => allSessions.add(t.sessionId));
    const completedSessions = sessionsByStep['ticket_issued'] || new Set();
    const abandonedSessions = Array.from(allSessions).filter(
      s => !completedSessions.has(s)
    );

    return NextResponse.json({
      summary: {
        totalSessions: allSessions.size,
        completedSessions: completedSessions.size,
        abandonedSessions: abandonedSessions.length,
        overallConversion,
      },
      funnel,
      abandonedSessionIds: abandonedSessions.slice(0, 50), // Prime 50 per recovery
    });

  } catch (error) {
    console.error("Errore analytics funnel:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
