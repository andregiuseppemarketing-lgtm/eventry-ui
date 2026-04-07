import { Suspense } from 'react';
import { EventDetailPageClient } from '@/components/events/event-detail-client';
import { Loader2 } from 'lucide-react';


export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <EventDetailPageClient params={params} />
    </Suspense>
  );
}
