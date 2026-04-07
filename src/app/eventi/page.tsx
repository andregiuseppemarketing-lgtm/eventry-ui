import { Suspense } from 'react';
import { EventiPageClient } from '@/components/events/eventi-page-client';
import { Loader2 } from 'lucide-react';


/**
 * /eventi - Hub centrale eventi
 * Lista eventi con quick actions role-based
 */
export default function EventiPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento eventi...</p>
        </div>
      </div>
    }>
      <EventiPageClient />
    </Suspense>
  );
}
