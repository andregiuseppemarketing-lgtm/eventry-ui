import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { getOnboardingStatus } from '@/lib/onboarding-helpers';

/**
 * GET /api/onboarding/status
 * Check user's onboarding completion status
 * Used by client-side OnboardingGuard component
 */
export async function GET(req: NextRequest) {
  try {
    // Verify authentication
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Get onboarding status from database
    const status = await getOnboardingStatus(session.user.id);

    return NextResponse.json({
      step1Completed: status.step1Completed,
      step2Completed: status.step2Completed,
      onboardingComplete: status.onboardingComplete,
      currentStep: status.currentStep,
      exists: status.exists,
    });
  } catch (error) {
    console.error('[API] Onboarding status error:', error);
    
    return NextResponse.json(
      { error: 'Errore durante il controllo dello stato di onboarding' },
      { status: 500 }
    );
  }
}
