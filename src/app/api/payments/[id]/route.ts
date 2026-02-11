import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const payment = await prisma.ticket.findUnique({
      where: { id },
      select: {
        id: true,
        code: true,
        paid: true,
        paymentStatus: true,
        paymentIntentId: true,
        receiptUrl: true,
        price: true,
        currency: true,
        status: true,
        issuedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Pagamento non trovato' },
        { status: 404 }
      );
    }

    // Verifica che il ticket appartenga all'utente corrente
    const fullTicket = await prisma.ticket.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (fullTicket?.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Errore recupero pagamento:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero del pagamento' },
      { status: 500 }
    );
  }
}
