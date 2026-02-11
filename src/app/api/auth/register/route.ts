import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { RegisterStepOneSchema } from '@/lib/validations';

/**
 * POST /api/auth/register
 * Step 1: Email + Password + Consents
 * Creates user account and initiates onboarding process
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    console.log('[Register] Request body:', body);
    
    // Validate input
    const validated = RegisterStepOneSchema.parse(body);
    const { email, password, termsAccepted, privacyAccepted } = validated;
    
    console.log('[Register] Validated data:', { email, termsAccepted, privacyAccepted });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email già registrata' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);
    
    const now = new Date();

    // Create user + consents + onboarding progress in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user (minimal data - only email + password)
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          name: email.split('@')[0], // Temporary name until step 2
          role: 'USER', // Default role
          ageVerified: false, // Will verify in step 2 with birthDate
          identityVerified: false,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      // Create user consents record
      await tx.userConsent.create({
        data: {
          userId: user.id,
          termsAccepted,
          termsAcceptedAt: termsAccepted ? now : null,
          privacyAccepted,
          privacyAcceptedAt: privacyAccepted ? now : null,
          marketingOptIn: false, // Default, can update in step 2
          newsletterOptIn: false,
        },
      });

      // Create onboarding progress tracker
      await tx.onboardingProgress.create({
        data: {
          userId: user.id,
          currentStep: 2, // Next step: profile
          step1Completed: true,
          step2Completed: false,
          step3Completed: false,
          onboardingComplete: false,
        },
      });

      return user;
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: result.id,
          email: result.email,
          nextStep: 2,
          message: 'Account creato con successo',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Register] Error:', error);
    
    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      console.error('[Register] Validation failed:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: 'Dati non validi', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante la registrazione' },
      { status: 500 }
    );
  }
}