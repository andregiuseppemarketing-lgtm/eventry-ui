import { prisma } from '@/lib/prisma';

/**
 * Onboarding status interface
 * Used by middleware and server components to check user onboarding progress
 */
export interface OnboardingStatus {
  step1Completed: boolean;
  step2Completed: boolean;
  onboardingComplete: boolean;
  currentStep: number;
  exists: boolean; // Whether OnboardingProgress record exists
}

/**
 * Get user's onboarding status from database
 * 
 * @param userId - User ID to check
 * @returns OnboardingStatus object with completion flags (always returns object, never null)
 * 
 * @example
 * ```typescript
 * const status = await getOnboardingStatus(userId);
 * if (!status.onboardingComplete) {
 *   // Redirect to appropriate step
 * }
 * ```
 */
export async function getOnboardingStatus(userId: string): Promise<OnboardingStatus> {
  try {
    const onboarding = await prisma.onboardingProgress.findFirst({
      where: { userId },
      select: {
        step1Completed: true,
        step2Completed: true,
        onboardingComplete: true,
        currentStep: true,
      },
    });

    // Case 1: No OnboardingProgress record found (corrupted state)
    if (!onboarding) {
      console.warn(`[Onboarding] No OnboardingProgress found for user ${userId}`);
      return {
        step1Completed: false,
        step2Completed: false,
        onboardingComplete: false,
        currentStep: 1,
        exists: false,
      };
    }

    // Case 2: Record exists, return actual status
    return {
      step1Completed: onboarding.step1Completed,
      step2Completed: onboarding.step2Completed,
      onboardingComplete: onboarding.onboardingComplete,
      currentStep: onboarding.currentStep,
      exists: true,
    };
  } catch (error) {
    console.error('[Onboarding] Error fetching onboarding status:', error);
    
    // Fail-safe: treat as incomplete onboarding
    return {
      step1Completed: false,
      step2Completed: false,
      onboardingComplete: false,
      currentStep: 1,
      exists: false,
    };
  }
}

/**
 * Check if user needs to complete onboarding
 * 
 * @param status - OnboardingStatus object from getOnboardingStatus
 * @returns true if user needs to complete onboarding steps
 */
export function needsOnboarding(status: OnboardingStatus): boolean {
  return !status.onboardingComplete;
}

/**
 * Get the next onboarding step path for user
 * 
 * @param status - OnboardingStatus object from getOnboardingStatus
 * @returns Path to redirect user to (/auth/register or /onboarding/step-2)
 */
export function getOnboardingRedirectPath(status: OnboardingStatus): string {
  // No record exists → start from beginning
  if (!status.exists) {
    return '/auth/register';
  }

  // Step 1 incomplete → go to register
  if (!status.step1Completed) {
    return '/auth/register';
  }

  // ✅ CHECK COMPLETION FIRST (before checking currentStep)
  // Onboarding complete → user profile
  if (status.onboardingComplete) {
    return '/user/profilo';
  }

  // Use currentStep as source of truth for incomplete onboarding
  // This is more reliable than checking boolean combinations
  if (status.currentStep === 2) {
    return '/onboarding/step-2';
  }

  // currentStep 3 but NOT onboardingComplete → step-3 (optional phone)
  if (status.currentStep === 3) {
    return '/onboarding/step-3';
  }

  // Fallback checks using boolean flags
  if (status.step1Completed && !status.step2Completed) {
    return '/onboarding/step-2';
  }

  if (status.step1Completed && status.step2Completed && !status.onboardingComplete) {
    console.warn('[Onboarding] Inconsistent state: steps complete but onboardingComplete=false');
    return '/onboarding/step-3';
  }

  // Final fallback
  return '/user/profilo';
}
