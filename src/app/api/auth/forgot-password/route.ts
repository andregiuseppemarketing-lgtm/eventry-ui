import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

/**
 * POST /api/auth/forgot-password
 * Invia email di recupero password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Verifica che l'utente esista
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, firstName: true },
    });

    // IMPORTANTE: Per sicurezza, non rivelare se l'email esiste o no
    // Rispondi sempre con successo
    if (!user) {
      // Simula delay per non rivelare che l'utente non esiste
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({
        success: true,
        message: 'Se l\'email esiste, riceverai un link per il recupero password',
      });
    }

    // Genera token casuale per reset password
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Scadenza: 1 ora
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000);

    // Salva token nel database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry,
      },
    });

    // Invia email con link di reset
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.firstName || 'Utente', resetUrl);

    console.log('[Forgot Password] Reset token generated for:', email);
    console.log('[Forgot Password] Reset URL sent via email:', resetUrl);
    console.log('[Forgot Password] Token expires at:', resetTokenExpiry.toISOString());

    return NextResponse.json({
      success: true,
      message: 'Se l\'email esiste, riceverai un link per il recupero password',
    });
  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    
    return NextResponse.json(
      { error: 'Errore durante la richiesta di recupero password' },
      { status: 500 }
    );
  }
}
