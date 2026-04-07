import { Suspense } from 'react';
import { EventConsumptionsPageClient } from '@/components/events/event-consumptions-client';
import { Loader2 } from 'lucide-react';


export default function EventConsumptionsPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento consumazioni...</p>
        </div>
      </div>
    }>
      <EventConsumptionsPageClient params={params} />
    </Suspense>
  );
}
