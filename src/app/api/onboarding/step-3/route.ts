import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

/**
 * POST /api/onboarding/step-3
 * Step 3: Username & Display Name selection
 * Sets onboardingComplete = true (final step)
 */

const step3Schema = z.object({
  username: z.string()
    .min(3, 'Minimo 3 caratteri')
    .max(30, 'Massimo 30 caratteri')
    .regex(/^[a-zA-Z0-9._]+$/, 'Solo lettere, numeri, punto e underscore'),
  displayName: z.string()
    .min(1, 'Nome pubblico obbligatorio')
    .max(50, 'Massimo 50 caratteri'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = step3Schema.parse(body);

    const userId = session.user.id;
    const usernameLower = validated.username.toLowerCase();

    console.log('[Step 3] User:', userId);
    console.log('[Step 3] Username:', usernameLower);
    console.log('[Step 3] Display Name:', validated.displayName);

    // Check username availability (double-check server-side)
    const existingUser = await prisma.user.findUnique({
      where: { username: usernameLower },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username già in uso' },
        { status: 400 }
      );
    }

    // Update User with username and displayName
    await prisma.user.update({
      where: { id: userId },
      data: {
        username: usernameLower,
        displayName: validated.displayName,
      },
    });

    // Update OnboardingProgress: step3 complete + onboarding complete
    await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        step3Completed: true,
        onboardingComplete: true, // ✅ FINAL STEP
        currentStep: 4, // Completed all steps
      },
    });

    console.log('[Step 3] ✅ Onboarding COMPLETED for user:', userId);
    console.log('[Step 3] → Redirect to /user/profilo');

    return NextResponse.json({
      success: true,
      data: {
        username: usernameLower,
        displayName: validated.displayName,
        nextStep: '/user/profilo',
        message: 'Benvenuto su Panico! 🎉',
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dati non validi', details: (error as any).errors },
        { status: 400 }
      );
    }

    console.error('[Step 3] Error:', error);
    return NextResponse.json(
      { error: 'Errore durante il salvataggio' },
      { status: 500 }
    );
  }
}
