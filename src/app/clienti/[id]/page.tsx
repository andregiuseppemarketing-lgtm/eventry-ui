import { Suspense } from 'react';
import { ClienteDetailPageClient } from '@/components/cliente-detail-client';
import { Loader2 } from 'lucide-react';


export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <ClienteDetailPageClient params={params} />
    </Suspense>
  );
}
