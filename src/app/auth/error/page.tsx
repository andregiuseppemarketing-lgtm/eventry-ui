'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'CredentialsSignin':
        return 'Credenziali non valide. Verifica email e password.';
      case 'OAuthSignin':
        return 'Errore durante l\'accesso con il provider OAuth.';
      case 'OAuthCallback':
        return 'Errore durante il callback OAuth.';
      case 'OAuthCreateAccount':
        return 'Impossibile creare l\'account con OAuth.';
      case 'EmailCreateAccount':
        return 'Impossibile creare l\'account con email.';
      case 'Callback':
        return 'Errore durante il callback di autenticazione.';
      case 'OAuthAccountNotLinked':
        return 'Email già registrata con un altro metodo di accesso.';
      case 'EmailSignin':
        return 'Impossibile inviare l\'email di accesso.';
      case 'SessionRequired':
        return 'Devi effettuare l\'accesso per vedere questa pagina.';
      case 'Default':
      default:
        return 'Si è verificato un errore durante l\'autenticazione.';
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-destructive/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center space-y-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tight gradient-text">PANICO</h1>
              <p className="mt-3 text-muted-foreground">Errore di autenticazione</p>
            </div>
          </div>

          {/* Card errore con glassmorphism */}
          <div className="group relative rounded-2xl glass border border-destructive/40 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
            <div className="relative">
              {/* Icona errore */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <svg
                    className="h-12 w-12 text-destructive"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-center mb-4">
                Errore di Autenticazione
              </h2>

              <p className="text-center text-muted-foreground mb-8">
                {getErrorMessage(error)}
              </p>

              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="block w-full rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-center text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5"
                >
                  Torna al Login
                </Link>

                <Link
                  href="/auth/register"
                  className="block w-full rounded-lg border border-border glass py-3.5 text-center text-sm font-medium transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                >
                  Crea un nuovo account
                </Link>
              </div>

              {error && (
                <div className="mt-6 rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3">
                  <p className="text-xs text-muted-foreground text-center">
                    Codice errore: <span className="font-mono text-destructive">{error}</span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Hai bisogno di aiuto?{' '}
            <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Contattaci
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Caricamento...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
