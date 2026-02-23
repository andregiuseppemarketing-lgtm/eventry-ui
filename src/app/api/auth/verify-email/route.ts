import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { rateLimitOr429, getClientIp } from '@/lib/ratelimit';

/**
 * GET /api/auth/verify-email?token=...
 * Verifica l'email dell'utente tramite token inviato via email
 * 
 * Rate Limit: 10 verifiche per ora per IP
 */
export async function GET(req: NextRequest) {
  // Rate limiting: 10 verifiche per ora per IP
  const ip = getClientIp(req);
  const rateLimitResult = await rateLimitOr429(req, {
    key: 'verify-email',
    identifier: ip,
    limit: 10,
    window: '1h',
  });

  if (!rateLimitResult.ok) {
    return rateLimitResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    // Validazione input
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token non valido' },
        { status: 400 }
      );
    }

    // Hash del token per confronto
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Trova token di verifica valido
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token: tokenHash },
      include: { user: { select: { id: true, email: true, emailVerified: true } } },
    });

    // Token non trovato
    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token non valido o già utilizzato' },
        { status: 400 }
      );
    }

    // Token scaduto
    if (verificationToken.expires < new Date()) {
      // Elimina token scaduto
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { 
          error: 'Token scaduto',
          message: 'Il link di verifica è scaduto. Richiedi un nuovo link.',
        },
        { status: 400 }
      );
    }

    // Email già verificata
    if (verificationToken.user.emailVerified) {
      // Elimina token usato
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      });

      return NextResponse.json(
        { 
          success: true,
          message: 'Email già verificata in precedenza',
          alreadyVerified: true,
        }
      );
    }

    // Verifica email + elimina token in transazione
    await prisma.$transaction([
      prisma.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerified: new Date() },
      }),
      prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id },
      }),
    ]);

    console.log('[Verify Email] Email verified for:', verificationToken.user.email);

    return NextResponse.json({
      success: true,
      message: 'Email verificata con successo! Ora puoi accedere.',
      email: verificationToken.user.email,
    });
  } catch (error) {
    console.error('[Verify Email] Error:', error);
    
    return NextResponse.json(
      { error: 'Errore durante la verifica dell\'email' },
      { status: 500 }
    );
  }
}
