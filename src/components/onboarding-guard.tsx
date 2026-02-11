'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Route } from 'next';

/**
 * Client-side onboarding guard component
 * Redirects users to appropriate onboarding step if not completed
 * 
 * Usage:
 * ```tsx
 * export default function ProtectedPage() {
 *   return (
 *     <OnboardingGuard>
 *       <YourPageContent />
 *     </OnboardingGuard>
 *   );
 * }
 * ```
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (status === 'loading') {
        return; // Wait for session to load
      }

      if (status === 'unauthenticated') {
        router.push('/auth/login' as Route);
        return;
      }

      if (status === 'authenticated' && session?.user?.id) {
        try {
          // Check onboarding status via API
          const res = await fetch('/api/onboarding/status');
          
          if (!res.ok) {
            throw new Error('Failed to check onboarding status');
          }

          const data = await res.json();

          // If onboarding not complete, redirect to appropriate step
          if (!data.onboardingComplete) {
            if (!data.step1Completed) {
              router.push('/auth/register' as Route);
            } else if (!data.step2Completed) {
              router.push('/onboarding/step-2' as Route);
            } else if (!data.step3Completed) {
              // Step 1 & 2 done, but step 3 (username) pending
              router.push('/onboarding/step-3' as Route);
            } else {
              // All steps done but not marked complete (edge case - should not happen)
              // Force to step-3 as fallback
              router.push('/onboarding/step-3' as Route);
            }
          } else {
            // Onboarding complete, allow access
            setIsChecking(false);
          }
        } catch (error) {
          console.error('[OnboardingGuard] Error checking onboarding:', error);
          // On error, allow access (fail-open to prevent blocking users)
          setIsChecking(false);
        }
      }
    };

    checkOnboarding();
  }, [status, session, router]);

  // Show nothing while checking
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
