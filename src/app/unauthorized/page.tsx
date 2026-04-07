import { Suspense } from 'react';
import { UnauthorizedPageClient } from '@/components/unauthorized-client';
import { Loader2 } from 'lucide-react';


export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </div>
    }>
      <UnauthorizedPageClient />
    </Suspense>
  );
}
