'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Checkbox } from '@/components/ui/checkbox';
import { PasswordStrengthIndicator } from '@/components/password-strength-indicator';
import { Check, X, Eye, EyeOff } from 'lucide-react';

export function RegisterFormClient() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verifica che le password coincidano
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    // Devono essere accettati i termini
    if (!termsAccepted) {
      setError('Devi accettare i Termini di Servizio e la Privacy Policy');
      return;
    }

    setLoading(true);

    try {
      // STEP 1: chiamata alla tua API di registrazione
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          termsAccepted,
          privacyAccepted: termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[Register] API error:', data);
        
        // Gestisci errori di validazione Zod
        if (data.details) {
          try {
            const zodError = JSON.parse(data.details);
            if (Array.isArray(zodError) && zodError.length > 0) {
              setError(zodError[0].message);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Non è un errore Zod, usa il messaggio generico
          }
        }
        
        setLoading(false);
        setError(data.error || 'Errore durante la registrazione');
        return;
      }

      console.log('[Register] User created successfully');

      // ✅ NEW FLOW: Redirect to verify-email-sent page
      // No auto-login until email is verified
      const email = formData.email;
      router.push(`/auth/verify-email-sent?email=${encodeURIComponent(email)}`);

    } catch (err: any) {
      console.error('[Register] Error:', err);
      setLoading(false);
      setError(err.message || 'Errore durante la registrazione');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
              <p className="mt-3 text-muted-foreground">Crea il tuo account</p>
            </div>
          </div>

          {/* Card registrazione con glassmorphism */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            {/* Bordo luminoso al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight">Registrati</h2>
              <p className="mt-2 text-sm text-muted-foreground">Compila i campi per creare il tuo account</p>

              {error && (
                <div className="mt-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 mt-8">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="email@esempio.com"
                    className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Nascondi password" : "Mostra password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Indicatore forza password */}
                  <PasswordStrengthIndicator password={formData.password} />
                </div>

                {/* Conferma Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Conferma Password *
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 pr-12 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Nascondi password" : "Mostra password"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <X className="w-3 h-3" />
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

                {/* Terms Consent Checkbox */}
                <div className="flex items-start space-x-3 rounded-lg border border-white/10 bg-zinc-900/50 p-4">
                  <Checkbox
                    id="termsAccepted"
                    checked={termsAccepted}
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor="termsAccepted"
                    className="text-sm text-zinc-300 leading-relaxed cursor-pointer"
                  >
                    Confermo di aver letto e accettato i{' '}
                    <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Termini di Servizio
                    </Link>{' '}
                    e la{' '}
                    <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300 underline" target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                {/* Info Box */}
                <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                  <p className="text-sm text-blue-200">
                    ℹ️ <strong>Registrazione in 3 step:</strong> Dopo questa fase, ti chiederemo di completare il profilo e verificare il telefono.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  <span className="relative z-10">{loading ? 'Registrazione...' : 'Continua →'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </form>

              <div className="mt-8 text-center text-sm text-muted-foreground">
                Hai già un account?{' '}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Accedi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
