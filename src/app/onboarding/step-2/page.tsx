import { Suspense } from 'react';
import { OnboardingStep2PageClient } from '@/components/onboarding/onboarding-step-2-page-client';
import { Loader2 } from 'lucide-react';


export default function OnboardingStep2Page() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <OnboardingStep2PageClient />
    </Suspense>
  );
}
