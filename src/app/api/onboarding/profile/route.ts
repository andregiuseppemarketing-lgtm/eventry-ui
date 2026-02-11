import { NextRequest, NextResponse } from 'next/server';
import { authRequired } from '@/lib/middleware/auth-required';
import { RegisterStepTwoSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';
import { calculateAge } from '@/lib/age-verification';

/**
 * PATCH /api/onboarding/profile
 * Step 2: Complete user profile
 * Requires authentication (must have completed step 1)
 */
export async function PATCH(req: NextRequest) {
  try {
    // Verify authentication
    const authData = await authRequired(req);
    if ('status' in authData) return authData; // Error response

    const { userId } = authData;

    // Validate input
    const body = await req.json();
    const validated = RegisterStepTwoSchema.parse(body);
    
    const { 
      firstName, 
      lastName, 
      birthDate, 
      provincia,
      city, 
      gender, 
      marketingOptIn 
    } = validated;

    // Calculate age from birthDate
    const birthDateObj = new Date(birthDate);
    const age = calculateAge(birthDateObj);

    // Check minimum age (18+)
    if (age < 18) {
      return NextResponse.json(
        { error: 'Devi avere almeno 18 anni per registrarti' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update user profile + consents + onboarding progress in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update User with profile data
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          name: `${firstName} ${lastName}`, // Full name
          displayName: firstName, // Default display name
          birthDate: birthDateObj,
          age,
          ageVerified: true, // Self-declared with birthDate
          
          // Create or update UserProfile
          userProfile: {
            upsert: {
              create: {
                provincia,
                city,
                gender,
                isPublic: true,
              },
              update: {
                provincia,
                city,
                gender,
              },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          age: true,
          ageVerified: true,
        },
      });

      // Update marketing consent if provided
      if (marketingOptIn !== undefined) {
        await tx.userConsent.upsert({
          where: { userId },
          update: {
            marketingOptIn,
            marketingOptInAt: marketingOptIn ? now : null,
          },
          create: {
            userId,
            marketingOptIn,
            marketingOptInAt: marketingOptIn ? now : null,
            termsAccepted: true, // Already accepted in step 1
            termsAcceptedAt: now,
            privacyAccepted: true, // Already accepted in step 1
            privacyAcceptedAt: now,
          },
        });
      }

      // Mark step 2 as complete, but NOT onboarding
      // Step 3 (username selection) is required before onboardingComplete: true
      await tx.onboardingProgress.upsert({
        where: { userId },
        update: {
          currentStep: 3, // Next: username selection
          step2Completed: true,
          step3Completed: false, // Username step still pending
          onboardingComplete: false, // ⚠️ NOT COMPLETE YET - need step 3
          // completedAt will be set in step-3 API
        },
        create: {
          userId,
          currentStep: 3, // Direct to step 3
          step1Completed: true,
          step2Completed: true,
          step3Completed: false, // Username step pending
          onboardingComplete: false, // ⚠️ NOT COMPLETE YET
          // completedAt will be set when onboarding truly completes
        },
      });

      return user;
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        onboardingComplete: false, // ⚠️ Step 3 still needed
        nextStep: '/onboarding/step-3', // Redirect to username selection
        message: 'Profilo base completato! Ora scegli il tuo username.',
      },
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Zod validation error
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Dati non validi', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Errore durante l\'aggiornamento del profilo' },
      { status: 500 }
    );
  }
}
