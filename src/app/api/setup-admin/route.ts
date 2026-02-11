import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Endpoint temporaneo per setup admin
// IMPORTANTE: Rimuovere dopo l'uso!
export async function POST(request: Request) {
  try {
    const { email, secret } = await request.json();

    // Chiave segreta per sicurezza (usa la tua NEXTAUTH_SECRET)
    if (secret !== process.env.NEXTAUTH_SECRET) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email richiesta' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    return NextResponse.json({
      success: true,
      user: {
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error('Errore setup admin:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
