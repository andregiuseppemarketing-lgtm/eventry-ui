import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/tickets/check-status?qr=<qrData>
 * Verifica validità QR code e ritorna dettagli ticket
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const qr = searchParams.get("qr");

    if (!qr) {
      return NextResponse.json(
        { error: "Parametro QR mancante" },
        { status: 400 }
      );
    }

    // Cerca ticket tramite qrData o code
    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [
          { qrData: qr },
          { code: qr },
        ],
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            dateEnd: true,
            ticketType: true,
            venue: {
              select: {
                name: true,
                address: true,
                city: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        checkins: {
          select: {
            id: true,
            scannedAt: true,
            gate: true,
          },
          orderBy: {
            scannedAt: "desc",
          },
          take: 1,
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({
        valid: false,
        message: "QR code non valido o non trovato",
      });
    }

    // Verifica se già usato (check-in effettuato)
    const checkedIn = ticket.status === "CHECKED_IN" || ticket.checkins.length > 0;

    return NextResponse.json({
      valid: true,
      ticket: {
        id: ticket.id,
        code: ticket.code,
        type: ticket.type,
        status: ticket.status,
        paid: ticket.paid,
        paymentStatus: ticket.paymentStatus,
        checkedIn: checkedIn,
        checkinTime: checkedIn && ticket.checkins[0] ? ticket.checkins[0].scannedAt : null,
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        dateStart: ticket.event.dateStart,
        dateEnd: ticket.event.dateEnd,
        ticketType: ticket.event.ticketType,
        venue: ticket.event.venue,
      },
      user: {
        name: ticket.user?.name || "Ospite",
        email: ticket.user?.email,
      },
      message: checkedIn 
        ? `Check-in già effettuato il ${ticket.checkins[0]?.scannedAt ? new Date(ticket.checkins[0].scannedAt).toLocaleString("it-IT") : "N/D"}`
        : ticket.paymentStatus === "PENDING" && ticket.type === "DOOR_ONLY"
        ? "Pagamento da completare al botteghino"
        : "QR valido - pronto per check-in",
    });
  } catch (error) {
    console.error("Errore verifica QR:", error);
    return NextResponse.json(
      { error: "Errore durante la verifica del QR" },
      { status: 500 }
    );
  }
}
