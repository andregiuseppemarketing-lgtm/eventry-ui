import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ISR: Cache per 60 secondi
export const revalidate = 60;
// Dynamic route - usa headers per auth
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user?.role === "ADMIN";

    // Summary: Statistiche globali
    const summary = await calculateSummary(userId, isAdmin);

    // Trend: Ultimi 30 giorni di vendite/entrate
    const trend = await calculateTrend(userId, isAdmin);

    // Top Events: Top 5 eventi per biglietti venduti
    const topEvents = await calculateTopEvents(userId, isAdmin);

    // Ticket Type Distribution
    const ticketTypeDistribution = await calculateTicketTypeDistribution(
      userId,
      isAdmin
    );

    return NextResponse.json({
      summary,
      trend,
      topEvents,
      ticketTypeDistribution,
    });
  } catch (error) {
    console.error("Errore GET /api/dashboard/stats:", error);
    return NextResponse.json(
      { error: "Errore nel recupero delle statistiche" },
      { status: 500 }
    );
  }
}

async function calculateSummary(userId: string, isAdmin: boolean) {
  const whereClause = isAdmin ? {} : { createdByUserId: userId };

  const [events, tickets, revenue] = await Promise.all([
    // Eventi creati
    prisma.event.count({ where: whereClause }),

    // Biglietti venduti/emessi
    prisma.ticket.count({
      where: isAdmin
        ? {}
        : {
            event: { createdByUserId: userId },
          },
    }),

    // Revenue totale
    prisma.ticket.aggregate({
      where: isAdmin
        ? { paid: true }
        : {
            event: { createdByUserId: userId },
            paid: true,
          },
      _sum: { price: true },
    }),
  ]);

  const checkIns = await prisma.checkIn.count({
    where: isAdmin
      ? {}
      : {
          ticket: {
            event: { createdByUserId: userId },
          },
        },
  });

  return {
    events,
    tickets,
    revenue: revenue._sum.price || 0,
    checkIns,
  };
}

async function calculateTrend(userId: string, isAdmin: boolean) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const tickets = await prisma.ticket.findMany({
    where: isAdmin
      ? { issuedAt: { gte: thirtyDaysAgo } }
      : {
          event: { createdByUserId: userId },
          issuedAt: { gte: thirtyDaysAgo },
        },
    select: {
      issuedAt: true,
      price: true,
      paid: true,
    },
    orderBy: { issuedAt: "asc" },
  });

  // Aggrega per giorno
  const trendMap = new Map<
    string,
    { date: string; tickets: number; revenue: number }
  >();

  tickets.forEach((ticket) => {
    const dateKey = ticket.issuedAt.toISOString().split("T")[0];
    const existing = trendMap.get(dateKey) || {
      date: dateKey,
      tickets: 0,
      revenue: 0,
    };

    existing.tickets += 1;
    if (ticket.paid && ticket.price) {
      existing.revenue += ticket.price;
    }

    trendMap.set(dateKey, existing);
  });

  return Array.from(trendMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );
}

async function calculateTopEvents(userId: string, isAdmin: boolean) {
  const whereClause = isAdmin ? {} : { createdByUserId: userId };

  const events = await prisma.event.findMany({
    where: whereClause,
    select: {
      id: true,
      title: true,
      _count: {
        select: { tickets: true },
      },
    },
    orderBy: {
      tickets: {
        _count: "desc",
      },
    },
    take: 5,
  });

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    ticketsSold: event._count.tickets,
  }));
}

async function calculateTicketTypeDistribution(
  userId: string,
  isAdmin: boolean
) {
  const tickets = await prisma.ticket.groupBy({
    by: ["type"],
    where: isAdmin
      ? {}
      : {
          event: { createdByUserId: userId },
        },
    _count: { type: true },
  });

  return tickets.map((item) => ({
    type: item.type,
    count: item._count.type,
  }));
}
