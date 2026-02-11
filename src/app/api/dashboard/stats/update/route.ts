import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
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
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Solo gli amministratori possono aggiornare le statistiche globali" },
        { status: 403 }
      );
    }

    // Ricalcola EventStats per tutti gli eventi
    const events = await prisma.event.findMany({
      select: {
        id: true,
        tickets: {
          select: {
            paid: true,
            price: true,
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    const updatePromises = events.map(async (event) => {
      const ticketsSold = event._count.tickets;
      const revenueTotal = event.tickets
        .filter((t) => t.paid && t.price)
        .reduce((sum, t) => sum + (t.price || 0), 0);

      const checkIns = await prisma.checkIn.count({
        where: {
          ticket: { eventId: event.id },
        },
      });

      return prisma.eventStats.upsert({
        where: { id: `stats_${event.id}` },
        update: {
          ticketsSold,
          revenueTotal,
          checkIns,
          updatedAt: new Date(),
        },
        create: {
          id: `stats_${event.id}`,
          eventId: event.id,
          ticketsSold,
          revenueTotal,
          checkIns,
        },
      });
    });

    await Promise.all(updatePromises);

    // Ricalcola UserStats per tutti gli utenti
    const users = await prisma.user.findMany({
      select: {
        id: true,
        eventsCreated: {
          select: { id: true },
        },
        ticketsOwned: {
          select: {
            paid: true,
            price: true,
          },
        },
      },
    });

    const userStatsPromises = users.map(async (user) => {
      const eventsCreated = user.eventsCreated.length;
      const ticketsBought = user.ticketsOwned.length;
      const totalSpent = user.ticketsOwned
        .filter((t) => t.paid && t.price)
        .reduce((sum, t) => sum + (t.price || 0), 0);

      return prisma.userStats.upsert({
        where: { userId: user.id },
        update: {
          eventsCreated,
          ticketsBought,
          totalSpent,
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          eventsCreated,
          ticketsBought,
          totalSpent,
        },
      });
    });

    await Promise.all(userStatsPromises);

    return NextResponse.json({
      success: true,
      message: "Statistiche aggiornate con successo",
      eventsUpdated: events.length,
      usersUpdated: users.length,
    });
  } catch (error) {
    console.error("Errore POST /api/dashboard/stats/update:", error);
    return NextResponse.json(
      { error: "Errore nell'aggiornamento delle statistiche" },
      { status: 500 }
    );
  }
}
