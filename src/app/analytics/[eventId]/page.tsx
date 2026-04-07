import { Suspense } from 'react';
import { EventDashboardPageClient } from '@/components/analytics/event-dashboard-client';
import { Loader2 } from 'lucide-react';


export default function EventDashboardPage({ params }: { params: Promise<{ eventId: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <EventDashboardPageClient params={params} />
    </Suspense>
  );
}
