'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const callbackUrl = (searchParams.get('callbackUrl') as Route | null) || '/user/profilo';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o password non corretti');
        setLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl as Route);
      } else {
        setError('Errore durante il login');
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Errore durante il login');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header con logo gradiente */}
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
              <p className="mt-3 text-muted-foreground">Accedi al pannello di gestione eventi</p>
            </div>
          </div>

          {/* Card login con glassmorphism */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            {/* Bordo luminoso al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight">Login</h2>
              <p className="mt-2 text-sm text-muted-foreground">Scegli come accedere al tuo account</p>

              {error && (
                <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="email@esempio.com"
                    className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                  />
                  <div className="text-center">
                    <Link 
                      href="/auth/forgot-password" 
                      className="text-sm text-primary hover:text-primary/80 font-medium underline underline-offset-2 transition-colors"
                    >
                      Password dimenticata?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="relative z-10">{loading ? 'Accesso in corso...' : 'Accedi'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Non hai un account?{' '}
                <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Registrati
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <LoginForm />
    </Suspense>
  );
}
