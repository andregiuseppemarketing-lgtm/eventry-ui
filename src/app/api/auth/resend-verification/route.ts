import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendEmailVerificationEmail } from '@/lib/email';
import { rateLimitOr429, getClientIp } from '@/lib/ratelimit';

/**
 * POST /api/auth/resend-verification
 * Reinvia email di verifica account
 * 
 * Rate Limit: 3 richieste per ora per IP (prevenire spam)
 */
export async function POST(req: NextRequest) {
  // Rate limiting: 3 resend per ora per IP
  const ip = getClientIp(req);
  const rateLimitResult = await rateLimitOr429(req, {
    key: 'resend-verification',
    identifier: ip,
    limit: 3,
    window: '1h',
  });

  if (!rateLimitResult.ok) {
    return rateLimitResult.response;
  }

  try {
    const body = await req.json();
    const { email } = body;

    // Validazione input
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email non valida' },
        { status: 400 }
      );
    }

    // Trova utente
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { 
        id: true, 
        email: true, 
        emailVerified: true,
        firstName: true,
      },
    });

    // Per sicurezza, non rivelare se l'utente esiste o no
    // Rispondi sempre con successo
    if (!user) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        success: true,
        message: 'Se l\'email esiste e non è ancora verificata, riceverai un nuovo link di verifica.',
      });
    }

    // Email già verificata
    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: 'Email già verificata. Puoi effettuare il login.',
        alreadyVerified: true,
      });
    }

    // Elimina eventuali token precedenti per questo utente
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    // Genera nuovo token di verifica
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Scadenza: 30 minuti
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    // Salva token nel database
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token: tokenHash,
        expires,
      },
    });

    // Costruisci URL di verifica
    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;

    // Invia email di verifica
    await sendEmailVerificationEmail(
      user.email,
      user.firstName || 'Utente',
      verifyUrl
    );

    console.log('[Resend Verification] Token generated for:', email);
    console.log('[Resend Verification] Verify URL:', verifyUrl);
    console.log('[Resend Verification] Token expires at:', expires.toISOString());

    return NextResponse.json({
      success: true,
      message: 'Email di verifica inviata con successo. Controlla la tua casella di posta.',
    });
  } catch (error) {
    console.error('[Resend Verification] Error:', error);
    
    return NextResponse.json(
      { error: 'Errore durante l\'invio dell\'email di verifica' },
      { status: 500 }
    );
  }
}
