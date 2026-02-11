import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/tickets - Ricerca tickets
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
    const code = searchParams.get('code');
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const myTickets = searchParams.get('myTickets') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');

    const where: any = {};

    // Filtra per userId se richiesto dal dashboard
    if (myTickets) {
      where.userId = session.user.id;
    }

    if (code) {
      where.OR = [
        { code: code.toUpperCase() },
        { qrData: code },
      ];
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            dateEnd: true,
            status: true,
            venue: {
              select: {
                name: true,
                city: true,
              }
            }
          }
        },
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        },
        listEntry: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: {
        issuedAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      tickets,
      count: tickets.length,
    });

  } catch (error) {
    console.error("Errore ricerca tickets:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
