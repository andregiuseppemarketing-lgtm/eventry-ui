import { Suspense } from 'react';
import { LoginFormClient } from '@/components/auth/login-form-client';


export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento login...</p>
        </div>
      </div>
    }>
      <LoginFormClient />
    </Suspense>
  );
}
