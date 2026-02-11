'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Errore durante l\'invio dell\'email');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError('Errore durante l\'invio della richiesta');
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
              href="/auth/login" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Torna al login
            </Link>
            
            <div>
              <h1 className="text-5xl font-bold tracking-tight gradient-text">PANICO</h1>
              <p className="mt-3 text-muted-foreground">Recupera la tua password</p>
            </div>
          </div>

          {/* Card recupero password */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            {/* Bordo luminoso al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
              {!success ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">Password dimenticata?</h2>
                      <p className="text-sm text-muted-foreground">Nessun problema, te la reinviamo</p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-6">
                    Inserisci l'email associata al tuo account e ti invieremo un link per reimpostare la password.
                  </p>

                  {error && (
                    <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
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
                        className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      <span className="relative z-10">
                        {loading ? 'Invio in corso...' : 'Invia link di recupero'}
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
                    <h2 className="text-2xl font-semibold mb-2">Email inviata!</h2>
                    <p className="text-muted-foreground">
                      Abbiamo inviato un link per il recupero password all'indirizzo <strong className="text-foreground">{email}</strong>
                    </p>
                  </div>

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                    <p className="text-sm text-blue-200">
                      📧 Controlla la tua casella email (anche nello spam) e clicca sul link per reimpostare la password.
                    </p>
                  </div>

                  <Link
                    href="/auth/login"
                    className="inline-block text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                  >
                    Torna al login
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
