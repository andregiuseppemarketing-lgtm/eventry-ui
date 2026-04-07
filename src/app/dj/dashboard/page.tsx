import { Suspense } from 'react';
import { DJDashboardClient } from '@/components/dj/dj-dashboard-client';
import { Loader2 } from 'lucide-react';


export default function DJDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento dashboard...</p>
        </div>
      </div>
    }>
      <DJDashboardClient />
    </Suspense>
  );
}

