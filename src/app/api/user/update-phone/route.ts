import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { phone } = await req.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Numero di telefono non valido' },
        { status: 400 }
      );
    }

    // Aggiorna il telefono dell'utente
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { phone },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Error updating phone:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento' },
      { status: 500 }
    );
  }
}
