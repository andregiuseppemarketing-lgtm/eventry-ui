import { Suspense } from 'react';
import { UserProfilePageClient } from '@/components/user-profilo-page-client';
import { Loader2 } from 'lucide-react';


export default function UserProfilePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <UserProfilePageClient />
    </Suspense>
  );
}
