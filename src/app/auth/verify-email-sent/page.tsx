'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailSentContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResend = async () => {
    if (!email) return;
    
    setResending(true);
    setResendMessage('');

    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setResendMessage('✅ Email inviata! Controlla la tua casella di posta.');
      } else {
        setResendMessage(`❌ ${data.error || 'Errore durante l\'invio'}`);
      }
    } catch (error) {
      setResendMessage('❌ Errore di connessione. Riprova più tardi.');
    } finally {
      setResending(false);
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
              <p className="mt-3 text-muted-foreground">Verifica il tuo account</p>
            </div>
          </div>

          {/* Card con glassmorphism */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative space-y-6">
              {/* Icona email */}
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Controlla la tua email</h2>
                <p className="text-muted-foreground text-sm">
                  Abbiamo inviato un link di verifica a:
                </p>
                {email && (
                  <p className="text-primary font-semibold">
                    {email}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                <p className="text-sm text-muted-foreground">
                  📧 Clicca sul link nell'email per completare la registrazione
                </p>
                <p className="text-sm text-muted-foreground">
                  ⏱️ Il link è valido per <strong>30 minuti</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  📂 Non trovi l'email? Controlla anche lo spam
                </p>
              </div>

              {/* Resend button */}
              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground">
                  Non hai ricevuto l'email?
                </p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || !email}
                  className="w-full py-3 px-4 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? 'Invio in corso...' : 'Invia di nuovo'}
                </button>

                {resendMessage && (
                  <p className={`text-sm text-center ${resendMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>

              {/* Login link */}
              <div className="pt-4 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Hai già verificato l'email?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline font-medium">
                    Accedi ora
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailSentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Caricamento...</div>}>
      <VerifyEmailSentContent />
    </Suspense>
  );
}
