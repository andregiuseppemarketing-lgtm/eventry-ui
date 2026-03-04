'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const verifyEmail = useCallback(async (token: string) => {
    try {
      const res = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message || 'Email verificata con successo!');
        setEmail(data.email || '');

        // Redirect al login dopo 3 secondi
        setTimeout(() => {
          router.push('/auth/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || data.message || 'Errore durante la verifica');
      }
    } catch {
      setStatus('error');
      setMessage('Errore di connessione. Riprova più tardi.');
    }
  }, [router]);

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token di verifica mancante');
      return;
    }

    verifyEmail(token);
  }, [searchParams, verifyEmail]);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10 text-center space-y-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Torna alla homepage
            </Link>
            
            <div>
              <h1 className="text-5xl font-bold tracking-tight gradient-text">EVENTRY</h1>
              <p className="mt-3 text-muted-foreground">Verifica account</p>
            </div>
          </div>

          {/* Card risultato */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative space-y-6">
              {/* Loading state */}
              {status === 'loading' && (
                <>
                  <div className="w-20 h-20 mx-auto">
                    <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold">Verifica in corso...</h2>
                    <p className="text-muted-foreground text-sm">
                      Attendere prego
                    </p>
                  </div>
                </>
              )}

              {/* Success state */}
              {status === 'success' && (
                <>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-green-600">Email verificata!</h2>
                    <p className="text-muted-foreground text-sm">
                      {message}
                    </p>
                    {email && (
                      <p className="text-primary font-semibold">
                        {email}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-sm text-green-700 dark:text-green-400 text-center">
                      🎉 Il tuo account è ora attivo.<br />
                      Verrai reindirizzato al login tra pochi secondi...
                    </p>
                  </div>

                  <Link
                    href="/auth/login"
                    className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-medium text-center hover:opacity-90 transition-opacity"
                  >
                    Vai al Login
                  </Link>
                </>
              )}

              {/* Error state */}
              {status === 'error' && (
                <>
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>

                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold text-red-600">Verifica fallita</h2>
                    <p className="text-muted-foreground text-sm">
                      {message}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm text-center text-muted-foreground">
                      Il link potrebbe essere scaduto o già utilizzato
                    </p>

                    <Link
                      href="/auth/register"
                      className="block w-full py-3 px-4 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium text-center transition-colors"
                    >
                      Richiedi nuovo link
                    </Link>

                    <Link
                      href="/auth/login"
                      className="block text-center text-sm text-primary hover:underline"
                    >
                      Torna al login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
