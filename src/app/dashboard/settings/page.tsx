import { Suspense } from 'react';
import { SettingsPageClient } from '@/components/dashboard/settings-page-client';


export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <SettingsPageClient />
    </Suspense>
  );
}
