import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/consumptions/[id] - Dettaglio consumazione
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

    const consumption = await prisma.consumption.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          } as any
        },
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            venue: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    });

    if (!consumption) {
      return NextResponse.json(
        { error: "Consumazione non trovata" },
        { status: 404 }
      );
    }

    return NextResponse.json(consumption);

  } catch (error) {
    console.error("Errore recupero consumazione:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// PUT /api/consumptions/[id] - Aggiorna consumazione
export async function PUT(
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

    // Solo ADMIN, ORGANIZER e STAFF possono aggiornare
    const allowedRoles = ['ADMIN', 'ORGANIZER', 'STAFF'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Permessi insufficienti" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { amount, category, items } = body;

    // Verifica che esista
    const existing = await prisma.consumption.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Consumazione non trovata" },
        { status: 404 }
      );
    }

    // Aggiorna
    const updated = await prisma.consumption.update({
      where: { id },
      data: {
        ...(amount !== undefined && { amount }),
        ...(category && { category }),
        ...(items !== undefined && { items }),
      },
      include: {
        ticket: {
          select: {
            code: true,
          }
        },
        event: {
          select: {
            title: true,
          }
        }
      }
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Errore aggiornamento consumazione:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// DELETE /api/consumptions/[id] - Elimina consumazione
export async function DELETE(
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

    // Solo ADMIN e ORGANIZER possono eliminare
    const allowedRoles = ['ADMIN', 'ORGANIZER'];
    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: "Permessi insufficienti" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verifica che esista
    const existing = await prisma.consumption.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Consumazione non trovata" },
        { status: 404 }
      );
    }

    // Elimina
    await prisma.consumption.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true,
      message: "Consumazione eliminata" 
    });

  } catch (error) {
    console.error("Errore eliminazione consumazione:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
