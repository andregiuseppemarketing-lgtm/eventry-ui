import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/tickets/update-status
 * Aggiorna stato pagamento di un ticket (utile per DOOR_ONLY)
 */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const { ticketId, paymentStatus, paid } = await req.json();

    if (!ticketId) {
      return NextResponse.json(
        { error: "ticketId mancante" },
        { status: 400 }
      );
    }

    // Verifica ticket esiste
    const existingTicket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: {
        id: true,
        userId: true,
        type: true,
        paymentStatus: true,
      },
    });

    if (!existingTicket) {
      return NextResponse.json(
        { error: "Ticket non trovato" },
        { status: 404 }
      );
    }

    // Verifica autorizzazione (proprietario o staff/admin)
    const isOwner = existingTicket.userId === session.user.id;
    const isStaff = session.user.role === "ADMIN" || session.user.role === "STAFF" || session.user.role === "SECURITY";

    if (!isOwner && !isStaff) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 403 }
      );
    }

    // Prepara dati aggiornamento
    const updateData: any = {};

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
      
      // Se pagamento completato, aggiorna anche paid
      if (paymentStatus === "PAID") {
        updateData.paid = true;
      }
    }

    if (typeof paid === "boolean") {
      updateData.paid = paid;
    }

    // Aggiorna ticket
    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            ticketType: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Stato ticket aggiornato",
      ticket: ticket,
    });
  } catch (error) {
    console.error("Errore aggiornamento stato ticket:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento del ticket" },
      { status: 500 }
    );
  }
}
