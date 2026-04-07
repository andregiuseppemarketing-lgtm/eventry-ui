import { Suspense } from 'react';
import { PrDashboardClient } from '@/components/pr/pr-dashboard-client';
import { Loader2 } from 'lucide-react';

export const metadata = {
  title: 'Dashboard PR - Eventry',
  description: 'Dashboard performance PR',
};

export default function PrDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Caricamento dashboard...</p>
          </div>
        </div>
      }
    >
      <PrDashboardClient />
    </Suspense>
  );
}
