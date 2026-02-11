import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import QRCode from "qrcode";

/**
 * POST /api/events/register
 * Registra un utente a un evento generando QR universale
 * Gestisce logica paid/paymentStatus basata su ticketType dell'evento
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId mancante" },
        { status: 400 }
      );
    }

    // Verifica evento esiste
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        ticketType: true,
        ticketPrice: true,
        maxGuests: true,
        status: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento non trovato" },
        { status: 404 }
      );
    }

    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Evento non disponibile per registrazioni" },
        { status: 403 }
      );
    }

    // Verifica se utente già registrato
    const existing = await prisma.ticket.findFirst({
      where: {
        userId: session.user.id,
        eventId: eventId,
        status: { not: "CANCELLED" },
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Già registrato a questo evento",
        ticket: existing,
      });
    }

    // Verifica capacità massima
    if (event.maxGuests && event.maxGuests > 0) {
      const ticketCount = await prisma.ticket.count({
        where: {
          eventId: eventId,
          status: { not: "CANCELLED" },
        },
      });

      if (ticketCount >= event.maxGuests) {
        return NextResponse.json(
          { error: "Evento al completo" },
          { status: 403 }
        );
      }
    }

    // Genera codice unico e QR
    const uniqueCode = `TKT-${Date.now()}-${randomBytes(6).toString("hex").toUpperCase()}`;
    const qrContent = JSON.stringify({
      ticketCode: uniqueCode,
      eventId: eventId,
      userId: session.user.id,
      timestamp: Date.now(),
    });
    const qrCodeBase64 = await QRCode.toDataURL(qrContent);

    // Determina paid e paymentStatus basato su ticketType
    let paid = false;
    let paymentStatus: "PENDING" | "PAID" = "PENDING";
    
    switch (event.ticketType) {
      case "FREE_LIST":
        paid = true;
        paymentStatus = "PAID";
        break;
      case "DOOR_ONLY":
        paid = false;
        paymentStatus = "PENDING";
        break;
      case "PRE_SALE":
      case "FULL_TICKET":
        // Questi devono passare per Stripe (gestito da /api/checkout/session)
        return NextResponse.json(
          { 
            error: "Questo evento richiede pagamento online",
            requiresPayment: true,
            ticketPrice: event.ticketPrice,
          },
          { status: 402 }
        );
      default:
        paid = false;
        paymentStatus = "PENDING";
    }

    // Crea ticket
    const ticket = await prisma.ticket.create({
      data: {
        userId: session.user.id,
        eventId: eventId,
        type: event.ticketType,
        code: uniqueCode,
        qrData: qrCodeBase64,
        status: "PAID", // QR già disponibile
        paid: paid,
        paymentStatus: paymentStatus,
        price: event.ticketPrice || 0,
        currency: "EUR",
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            venue: {
              select: {
                name: true,
                city: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registrazione completata con successo",
      ticket: ticket,
    });
  } catch (error) {
    console.error("Errore registrazione evento:", error);
    return NextResponse.json(
      { error: "Errore durante la registrazione all'evento" },
      { status: 500 }
    );
  }
}
