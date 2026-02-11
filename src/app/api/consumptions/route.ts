import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/consumptions - Crea nuova consumazione
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    // Solo ADMIN, ORGANIZER e STAFF possono registrare consumazioni
    const allowedRoles = ['ADMIN', 'ORGANIZER', 'STAFF'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Permessi insufficienti" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { ticketId, eventId, amount, category, items } = body;

    // Validazione
    if (!ticketId || !eventId || amount === undefined || !category) {
      return NextResponse.json(
        { error: "Campi obbligatori: ticketId, eventId, amount, category" },
        { status: 400 }
      );
    }

    if (amount < 0) {
      return NextResponse.json(
        { error: "L'importo deve essere >= 0" },
        { status: 400 }
      );
    }

    // Verifica che il ticket esista e appartenga all'evento
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { event: true }
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket non trovato" },
        { status: 404 }
      );
    }

    if (ticket.eventId !== eventId) {
      return NextResponse.json(
        { error: "Il ticket non appartiene a questo evento" },
        { status: 400 }
      );
    }

    // Crea la consumazione
    const consumption = await prisma.consumption.create({
      data: {
        ticketId,
        eventId,
        amount,
        category,
        items: items || null,
      },
      include: {
        ticket: {
          include: {
            guest: true,
            user: true,
          } as any
        },
        event: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    });

    return NextResponse.json(consumption, { status: 201 });

  } catch (error) {
    console.error("Errore creazione consumazione:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// GET /api/consumptions - Lista consumazioni con filtri
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const ticketId = searchParams.get('ticketId');
    const category = searchParams.get('category');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (ticketId) {
      where.ticketId = ticketId;
    }

    if (category) {
      where.category = category;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    // Query con paginazione
    const [consumptions, total] = await Promise.all([
      prisma.consumption.findMany({
        where,
        include: {
          ticket: {
            include: {
              guest: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                }
              },
              user: {
                select: {
                  id: true,
                  name: true,
                }
              }
            } as any
          },
          event: {
            select: {
              id: true,
              title: true,
              dateStart: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset,
      }),
      prisma.consumption.count({ where })
    ]);

    // Calcola totali
    const totalAmount = await prisma.consumption.aggregate({
      where,
      _sum: {
        amount: true
      }
    });

    return NextResponse.json({
      consumptions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      summary: {
        totalAmount: totalAmount._sum.amount || 0,
        count: total
      }
    });

  } catch (error) {
    console.error("Errore recupero consumazioni:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
