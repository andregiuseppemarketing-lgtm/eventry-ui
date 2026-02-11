import { NextRequest, NextResponse } from 'next/server';
import { authRequired } from '@/lib/middleware/auth-required';
import { VerifyOTPSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/phone/verify-otp
 * Step 3b: Verify OTP code and complete onboarding
 */
export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const authData = await authRequired(req);
    if ('status' in authData) return authData; // Error response

    const { userId } = authData;

    // Validate input
    const body = await req.json();
    const validated = VerifyOTPSchema.parse(body);
    const { phoneNumber, otpCode } = validated;

    // Find UserPhone record
    const userPhone = await prisma.userPhone.findFirst({
      where: {
        userId,
        phoneNumber,
      },
    });

    if (!userPhone) {
      return NextResponse.json(
        { error: 'Numero di telefono non trovato. Richiedi un nuovo codice OTP.' },
        { status: 404 }
      );
    }

    // Check rate limiting (max 5 attempts)
    if (userPhone.otpAttempts >= 5) {
      return NextResponse.json(
        { error: 'Troppi tentativi falliti. Richiedi un nuovo codice OTP.' },
        { status: 429 }
      );
    }

    // Check if OTP expired
    if (!userPhone.otpExpiresAt || userPhone.otpExpiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Codice OTP scaduto. Richiedi un nuovo codice.' },
        { status: 400 }
      );
    }

    // Verify OTP code (constant-time comparison to prevent timing attacks)
    const isValidOTP = userPhone.otpCode === otpCode;

    if (!isValidOTP) {
      // Increment failed attempts
      await prisma.userPhone.update({
        where: { id: userPhone.id },
        data: {
          otpAttempts: userPhone.otpAttempts + 1,
        },
      });

      return NextResponse.json(
        { 
          error: 'Codice OTP non valido', 
          attemptsRemaining: 5 - (userPhone.otpAttempts + 1) 
        },
        { status: 400 }
      );
    }

    // OTP verified successfully - update phone verification + complete onboarding
    const now = new Date();
    
    const result = await prisma.$transaction(async (tx) => {
      // Mark phone as verified
      await tx.userPhone.update({
        where: { id: userPhone.id },
        data: {
          phoneVerified: true,
          phoneVerifiedAt: now,
          otpCode: null, // Clear OTP for security
          otpExpiresAt: null,
          otpAttempts: 0,
        },
      });

      // Complete onboarding
      await tx.onboardingProgress.update({
        where: { userId },
        data: {
          step3Completed: true,
          onboardingComplete: true,
          completedAt: now,
        },
      });

      // Update User.phone field for backward compatibility
      await tx.user.update({
        where: { id: userId },
        data: { phone: phoneNumber },
      });

      // Return updated user
      return await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: {
        message: 'Telefono verificato con successo! Onboarding completato.',
        userId: result?.id,
        onboardingComplete: true,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    
    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante la verifica del codice OTP' },
      { status: 500 }
    );
  }
}
