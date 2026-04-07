import { Suspense } from 'react';
import { ClubsPageClient } from '@/components/clubs-page-client';
import { Loader2 } from 'lucide-react';


export default function ClubsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <ClubsPageClient />
    </Suspense>
  );
}
