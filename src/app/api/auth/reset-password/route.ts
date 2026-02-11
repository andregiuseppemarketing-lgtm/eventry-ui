import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * POST /api/auth/reset-password
 * Reimposta la password usando il token di reset
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    // Validazione input
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token non valido' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'La password deve essere di almeno 8 caratteri' },
        { status: 400 }
      );
    }

    // Validazione requisiti password
    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: 'La password deve contenere almeno una lettera maiuscola' },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: 'La password deve contenere almeno una lettera minuscola' },
        { status: 400 }
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        { error: 'La password deve contenere almeno un numero' },
        { status: 400 }
      );
    }

    // Hash del token per confronto
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trova utente con token valido
    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: {
          gt: new Date(), // Token non scaduto
        },
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token non valido o scaduto. Richiedi un nuovo link di recupero.' },
        { status: 400 }
      );
    }

    // Hash della nuova password
    const passwordHash = await bcrypt.hash(password, 10);

    // Aggiorna password e rimuovi token di reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    console.log('[Reset Password] Password reset successful for:', user.email);

    return NextResponse.json({
      success: true,
      message: 'Password reimpostata con successo',
    });
  } catch (error) {
    console.error('[Reset Password] Error:', error);
    
    return NextResponse.json(
      { error: 'Errore durante il reset della password' },
      { status: 500 }
    );
  }
}
