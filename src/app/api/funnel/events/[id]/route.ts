import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/funnel/events/[id] - Funnel per evento specifico
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id: eventId } = await params;

    // Verifica evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        dateStart: true,
      }
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    // Query tracking
    const trackings = await prisma.funnelTracking.findMany({
      where: { eventId },
      orderBy: {
        timestamp: 'asc'
      },
    });

    if (trackings.length === 0) {
      return NextResponse.json({
        event: {
          id: event.id,
          title: event.title,
          date: event.dateStart,
        },
        summary: {
          totalSessions: 0,
          completedSessions: 0,
          abandonedSessions: 0,
          overallConversion: 0,
        },
        funnel: [],
        sources: [],
        campaigns: [],
        abandonedCarts: [],
      });
    }

    // Raggruppa per sessione
    const sessionMap = new Map<string, {
      sessionId: string;
      steps: string[];
      email?: string;
      phone?: string;
      source?: string;
      campaign?: string;
      prCode?: string;
      firstStep: Date;
      lastStep: Date;
      completed: boolean;
    }>();

    trackings.forEach(t => {
      if (!sessionMap.has(t.sessionId)) {
        sessionMap.set(t.sessionId, {
          sessionId: t.sessionId,
          steps: [],
          email: t.guestEmail || undefined,
          phone: t.guestPhone || undefined,
          source: (t.metadata as any)?.source,
          campaign: (t.metadata as any)?.campaign,
          prCode: (t.metadata as any)?.prCode,
          firstStep: t.timestamp,
          lastStep: t.timestamp,
          completed: false,
        });
      }

      const session = sessionMap.get(t.sessionId)!;
      session.steps.push(t.step);
      session.lastStep = t.timestamp;
      
      if (t.step === 'ticket_issued') {
        session.completed = true;
      }

      if (t.guestEmail) session.email = t.guestEmail;
      if (t.guestPhone) session.phone = t.guestPhone;
    });

    // Calcola metriche
    const sessions = Array.from(sessionMap.values());
    const completedSessions = sessions.filter(s => s.completed);
    const abandonedSessions = sessions.filter(s => !s.completed);

    // Funnel steps
    const steps = ['view', 'click', 'form_start', 'form_complete', 'ticket_issued'];
    const funnel = steps.map((step, index) => {
      const sessionsWithStep = sessions.filter(s => s.steps.includes(step));
      const count = sessionsWithStep.length;
      const previousStep = index > 0 ? steps[index - 1] : null;
      const previousCount = previousStep 
        ? sessions.filter(s => s.steps.includes(previousStep)).length 
        : count;
      
      const conversionRate = previousCount > 0 ? (count / previousCount) * 100 : 0;
      const dropOffRate = 100 - conversionRate;

      return {
        step,
        sessions: count,
        conversionRate: index === 0 ? 100 : conversionRate,
        dropOffRate: index === 0 ? 0 : dropOffRate,
      };
    });

    // Analisi per source
    const sourceStats: Record<string, { sessions: number; conversions: number }> = {};
    sessions.forEach(s => {
      const source = s.source || 'direct';
      if (!sourceStats[source]) {
        sourceStats[source] = { sessions: 0, conversions: 0 };
      }
      sourceStats[source].sessions++;
      if (s.completed) sourceStats[source].conversions++;
    });

    // Analisi per campaign
    const campaignStats: Record<string, { sessions: number; conversions: number }> = {};
    sessions.forEach(s => {
      if (!s.campaign) return;
      if (!campaignStats[s.campaign]) {
        campaignStats[s.campaign] = { sessions: 0, conversions: 0 };
      }
      campaignStats[s.campaign].sessions++;
      if (s.completed) campaignStats[s.campaign].conversions++;
    });

    // Abandoned carts (hanno fatto form_start ma non completed)
    const abandonedCarts = abandonedSessions
      .filter(s => s.steps.includes('form_start'))
      .map(s => ({
        sessionId: s.sessionId,
        email: s.email,
        phone: s.phone,
        source: s.source,
        lastStep: s.steps[s.steps.length - 1],
        lastActivity: s.lastStep,
        timeSinceLastActivity: Date.now() - s.lastStep.getTime(),
      }))
      .slice(0, 100); // Prime 100

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.dateStart,
      },
      summary: {
        totalSessions: sessions.length,
        completedSessions: completedSessions.length,
        abandonedSessions: abandonedSessions.length,
        overallConversion: sessions.length > 0 
          ? (completedSessions.length / sessions.length) * 100 
          : 0,
      },
      funnel,
      sources: Object.entries(sourceStats).map(([source, stats]) => ({
        source,
        sessions: stats.sessions,
        conversions: stats.conversions,
        conversionRate: stats.sessions > 0 ? (stats.conversions / stats.sessions) * 100 : 0,
      })),
      campaigns: Object.entries(campaignStats).map(([campaign, stats]) => ({
        campaign,
        sessions: stats.sessions,
        conversions: stats.conversions,
        conversionRate: stats.sessions > 0 ? (stats.conversions / stats.sessions) * 100 : 0,
      })),
      abandonedCarts,
    });

  } catch (error) {
    console.error("Errore funnel evento:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
