import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * POST /api/auth/validate-reset-token
 * Valida un token di reset password senza consumarlo
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token non valido' },
        { status: 400 }
      );
    }

    // Hash del token per confronto
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Cerca utente con questo token
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
        { error: 'Token non valido o scaduto' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      valid: true,
    });
  } catch (error) {
    console.error('[Validate Reset Token] Error:', error);
    
    return NextResponse.json(
      { error: 'Errore durante la validazione del token' },
      { status: 500 }
    );
  }
}
