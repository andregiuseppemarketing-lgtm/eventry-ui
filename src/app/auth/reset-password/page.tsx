'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import Link from 'next/link';
import { Check, AlertCircle } from 'lucide-react';
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Valida il token all'avvio
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token mancante. Richiedi un nuovo link di recupero password.');
        setValidatingToken(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/validate-reset-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (res.ok) {
          setTokenValid(true);
        } else {
          const data = await res.json();
          setError(data.error || 'Token non valido o scaduto');
        }
      } catch (err) {
        setError('Errore durante la validazione del token');
      } finally {
        setValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validazioni
    if (formData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    // Validazione forza password
    if (!/[A-Z]/.test(formData.password)) {
      setError('La password deve contenere almeno una lettera maiuscola');
      return;
    }
    if (!/[a-z]/.test(formData.password)) {
      setError('La password deve contenere almeno una lettera minuscola');
      return;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('La password deve contenere almeno un numero');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante il reset della password');
        setLoading(false);
        return;
      }

      setSuccess(true);
      
      // Redirect al login dopo 3 secondi
      setTimeout(() => {
        router.push('/auth/login' as Route);
      }, 3000);
    } catch (err) {
      setError('Errore durante il reset della password');
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Validazione del link...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !validatingToken) {
    return (
      <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold tracking-tight gradient-text mb-4">EVENTRY</h1>
            </div>

            <div className="rounded-2xl glass border border-border p-8">
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Link non valido</h2>
                  <p className="text-muted-foreground">{error}</p>
                </div>

                <div className="space-y-3">
                  <Link
                    href="/auth/forgot-password"
                    className="block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                  >
                    Richiedi nuovo link
                  </Link>
                  
                  <Link
                    href="/auth/login"
                    className="block text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Torna al login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div>
              <h1 className="text-5xl font-bold tracking-tight gradient-text">EVENTRY</h1>
              <p className="mt-3 text-muted-foreground">Reimposta la tua password</p>
            </div>
          </div>

          {/* Card */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
              {!success ? (
                <>
                  <h2 className="text-2xl font-semibold tracking-tight mb-6">Nuova Password</h2>
                  
                  {error && (
                    <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Nuova Password */}
                    <div className="space-y-2">
                      <label htmlFor="password" className="text-sm font-medium text-foreground">
                        Nuova Password *
                      </label>
                      <input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        placeholder="••••••••"
                        minLength={8}
                        className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      
                      {/* Indicatore forza password */}
                      <PasswordStrengthIndicator password={formData.password} />
                    </div>

                    {/* Conferma Password */}
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                        Conferma Password *
                      </label>
                      <input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        placeholder="••••••••"
                        minLength={8}
                        className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Le password non coincidono
                        </p>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && (
                        <p className="text-xs text-green-500 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Le password coincidono
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || formData.password !== formData.confirmPassword}
                      className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <span className="relative z-10">
                        {loading ? 'Reimpostazione...' : 'Reimposta Password'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center space-y-6">
                  <div className="mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-semibold mb-2">Password Reimpostata!</h2>
                    <p className="text-muted-foreground">
                      La tua password è stata modificata con successo.
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-sm text-blue-200">
                      Verrai reindirizzato alla pagina di login tra pochi secondi...
                    </p>
                  </div>

                  <Link
                    href="/auth/login"
                    className="inline-block text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Vai al login ora
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
