import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/guests/[id]/consumptions - Storico consumazioni cliente
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

    const { id } = await params;

    // Verifica che il guest esista
    const guest = await prisma.guest.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true }
    });

    if (!guest) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    // Trova tutti i ticket del guest
    const tickets = await prisma.ticket.findMany({
      where: { guestId: id } as any,
      select: { id: true, eventId: true }
    });

    const ticketIds = tickets.map(t => t.id);

    if (ticketIds.length === 0) {
      return NextResponse.json({
        guest: {
          id: guest.id,
          firstName: guest.firstName,
          lastName: guest.lastName,
        },
        consumptions: [],
        stats: {
          totalSpent: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          favoriteCategory: null,
          lifetimeValue: 0,
        },
        byCategory: {},
        timeline: [],
      });
    }

    // Query consumazioni
    const consumptions = await prisma.consumption.findMany({
      where: {
        ticketId: {
          in: ticketIds
        }
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
          }
        },
        ticket: {
          select: {
            id: true,
            code: true,
            price: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcola statistiche
    const totalSpent = consumptions.reduce((sum, c) => sum + c.amount, 0);
    const totalOrders = consumptions.length;
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    // Categoria preferita
    const categoryCount: Record<string, number> = {};
    consumptions.forEach(c => {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    });

    let favoriteCategory = null;
    let maxCount = 0;
    Object.entries(categoryCount).forEach(([cat, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategory = cat;
      }
    });

    // Revenue by category
    const byCategory: Record<string, { count: number; revenue: number }> = {};
    consumptions.forEach(c => {
      if (!byCategory[c.category]) {
        byCategory[c.category] = { count: 0, revenue: 0 };
      }
      byCategory[c.category].count++;
      byCategory[c.category].revenue += c.amount;
    });

    // Timeline (raggruppata per evento)
    const eventMap = new Map<string, {
      eventId: string;
      eventTitle: string;
      eventDate: Date;
      consumptions: number;
      spent: number;
      ticketPrice: number;
    }>();

    consumptions.forEach(c => {
      const eventId = c.event.id;
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          eventId: c.event.id,
          eventTitle: c.event.title,
          eventDate: c.event.dateStart,
          consumptions: 0,
          spent: 0,
          ticketPrice: c.ticket.price || 0,
        });
      }
      const eventData = eventMap.get(eventId)!;
      eventData.consumptions++;
      eventData.spent += c.amount;
    });

    const timeline = Array.from(eventMap.values()).sort(
      (a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime()
    );

    // Lifetime Value (ticket prices + consumptions)
    const totalTicketRevenue = tickets.reduce((sum, t) => {
      const ticket = consumptions.find(c => c.ticketId === t.id)?.ticket;
      return sum + (ticket?.price || 0);
    }, 0);

    // Calculate unique ticket prices
    const uniqueTicketPrices = Array.from(new Set(
      consumptions.map(c => c.ticket.price || 0)
    )).reduce((sum, price) => sum + price, 0);

    const lifetimeValue = uniqueTicketPrices + totalSpent;

    return NextResponse.json({
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
      },
      consumptions: consumptions.map(c => ({
        id: c.id,
        amount: c.amount,
        category: c.category,
        items: c.items,
        createdAt: c.createdAt,
        event: {
          id: c.event.id,
          title: c.event.title,
          date: c.event.dateStart,
        },
        ticket: {
          code: c.ticket.code,
        }
      })),
      stats: {
        totalSpent,
        totalOrders,
        avgOrderValue,
        favoriteCategory,
        lifetimeValue,
      },
      byCategory,
      timeline,
    });

  } catch (error) {
    console.error("Errore recupero consumazioni guest:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
