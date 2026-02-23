import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { RegisterStepOneSchema } from '@/lib/validations';
import { rateLimitOr429, getClientIp } from '@/lib/ratelimit';
import crypto from 'crypto';
import { sendEmailVerificationEmail } from '@/lib/email';

/**
 * POST /api/auth/register
 * Step 1: Email + Password + Consents
 * Creates user account with emailVerified=null and sends verification email
 * 
 * Rate Limit: 5 registrations per hour per IP
 */
export async function POST(req: NextRequest) {
  // Rate limiting: 5 registrations per hour per IP
  const ip = getClientIp(req);
  const rateLimitResult = await rateLimitOr429(req, {
    key: 'register',
    identifier: ip,
    limit: 5,
    window: '1h',
  });

  if (!rateLimitResult.ok) {
    return rateLimitResult.response;
  }

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

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Token expires in 30 minutes
    const tokenExpires = new Date(Date.now() + 30 * 60 * 1000);

    // Create user + consents + onboarding progress + verification token in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user (emailVerified = null until verification)
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          emailVerified: null, // ✅ Null until email verified
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

      // Create email verification token
      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          token: tokenHash, // ✅ Store hashed token
          expires: tokenExpires,
        },
      });

      return user;
    });

    // Send verification email
    const verifyUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${verificationToken}`;
    
    await sendEmailVerificationEmail(
      result.email,
      result.email.split('@')[0],
      verifyUrl
    );

    console.log('[Register] User created:', result.email);
    console.log('[Register] Verification token sent via email');
    console.log('[Register] Token expires at:', tokenExpires.toISOString());

    console.log('[Register] User created:', result.email);
    console.log('[Register] Verification token sent via email');
    console.log('[Register] Token expires at:', tokenExpires.toISOString());

    return NextResponse.json(
      {
        success: true,
        data: {
          userId: result.id,
          email: result.email,
          message: 'Account creato con successo! Controlla la tua email per verificare l\'account.',
          verificationRequired: true,
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