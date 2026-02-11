import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    const body = await req.json();

    const { actionType, targetId, meta } = body;

    if (!actionType) {
      return NextResponse.json(
        { error: "Campo actionType obbligatorio" },
        { status: 400 }
      );
    }

    // Crea log analytics
    const log = await prisma.analyticsLog.create({
      data: {
        actionType,
        targetId: targetId || null,
        userId: session?.user?.id || null,
        meta: meta || null,
      },
    });

    return NextResponse.json({
      success: true,
      logId: log.id,
    });
  } catch (error) {
    console.error("Errore POST /api/analytics/log:", error);
    return NextResponse.json(
      { error: "Errore nel salvataggio del log" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Non autenticato" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user?.role === "ADMIN";

    const logs = await prisma.analyticsLog.findMany({
      where: isAdmin ? {} : { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Errore GET /api/analytics/log:", error);
    return NextResponse.json(
      { error: "Errore nel recupero dei log" },
      { status: 500 }
    );
  }
}
