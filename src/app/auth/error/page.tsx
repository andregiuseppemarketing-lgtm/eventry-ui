import { Suspense } from 'react';
import { AuthErrorClient } from '@/components/auth/auth-error-client';

// Route Segment Config - funziona solo in Server Components

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground">Caricamento...</div>
        </div>
      }
    >
      <AuthErrorClient />
    </Suspense>
  );
}
