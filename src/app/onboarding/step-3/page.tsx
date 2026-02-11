'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Route } from 'next';
import { useToast } from '@/hooks/use-toast';
import { Check, X, Loader2 } from 'lucide-react';

export default function OnboardingStep3Page() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  // Check username availability with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.username.length >= 3) {
        // Validate format
        const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
        if (!usernameRegex.test(formData.username)) {
          setUsernameError('Solo lettere, numeri, punto (.) e underscore (_)');
          setUsernameAvailable(false);
          return;
        }

        setCheckingUsername(true);
        setUsernameError('');
        
        try {
          const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(formData.username)}`);
          const data = await res.json();
          
          if (res.ok) {
            setUsernameAvailable(data.available);
            if (!data.available) {
              setUsernameError('Username già in uso');
            }
          }
        } catch (error) {
          console.error('Error checking username:', error);
        } finally {
          setCheckingUsername(false);
        }
      } else if (formData.username.length > 0) {
        setUsernameError('Minimo 3 caratteri');
        setUsernameAvailable(false);
      } else {
        setUsernameAvailable(null);
        setUsernameError('');
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timer);
  }, [formData.username]);

  // Show nothing while checking authentication (AFTER all hooks)
  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.username || !formData.displayName) {
      toast({
        title: 'Campi mancanti',
        description: 'Username e nome pubblico sono obbligatori',
        variant: 'destructive',
      });
      return;
    }

    if (!usernameAvailable) {
      toast({
        title: 'Username non valido',
        description: usernameError || 'Scegli un username disponibile',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/onboarding/step-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante il salvataggio');
      }

      console.log('[Step 3] API Response:', data);

      toast({
        title: 'Onboarding completato!',
        description: data.data?.message || 'Benvenuto su Panico! 🎉',
      });

      // Redirect to user profile (onboarding complete)
      const nextPage = (data.data?.nextStep as Route | undefined) || '/user/profilo';
      console.log('[Step 3] Redirecting to:', nextPage);
      router.push(nextPage);
    } catch (error) {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Gradienti animati di sfondo - COME STEP 1 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header con stile identico a step 1 */}
          <div className="mb-10 text-center space-y-6">
            <div>
              <h1 className="text-5xl font-bold tracking-tight gradient-text">EVENTRY</h1>
              <p className="mt-3 text-muted-foreground">Scegli il tuo username</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            <div className="h-1 flex-1 bg-primary rounded-full" /> {/* Step 1 completed */}
            <div className="h-1 flex-1 bg-primary rounded-full" /> {/* Step 2 completed */}
            <div className="h-1 flex-1 bg-primary rounded-full" /> {/* Step 3 current */}
          </div>

          {/* Card registrazione con glassmorphism - COME STEP 1 */}
          <div className="group relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            {/* Bordo luminoso al hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="relative">
              <h2 className="text-2xl font-semibold tracking-tight">Il tuo username unico</h2>
              <p className="mt-2 text-sm text-muted-foreground">Step 3 di 3 - Quasi fatto!</p>

              <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-foreground">
                Username *
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  required
                  placeholder="johnny_rossi_23"
                  minLength={3}
                  maxLength={30}
                  className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 pr-10 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check className="w-4 h-4 text-green-500" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
              {usernameError && (
                <p className="text-xs text-red-400">{usernameError}</p>
              )}
              {usernameAvailable === true && (
                <p className="text-xs text-green-400">✓ Username disponibile!</p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium text-foreground">
                Nome Pubblico *
              </label>
              <input
                id="displayName"
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                placeholder="Johnny Rossi"
                maxLength={50}
                className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Info Box - Specifiche sotto */}
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 space-y-3">
              <div>
                <p className="text-xs text-blue-200">
                  <span className="font-semibold">Il tuo link pubblico:</span> /u/{formData.username || 'username'}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-200">
                  <span className="font-semibold">Nome Pubblico:</span> Quello che gli altri vedranno sul tuo profilo
                </p>
              </div>
              <div className="pt-2 border-t border-blue-500/20 space-y-1">
                <p className="text-xs font-semibold text-blue-300">Requisiti Username:</p>
                <p className="text-xs text-blue-200/80">• Da 3 a 30 caratteri</p>
                <p className="text-xs text-blue-200/80">• Solo lettere (a-z), numeri (0-9), punto (.) e underscore (_)</p>
                <p className="text-xs text-blue-200/80">• Non può essere cambiato dopo la creazione</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !usernameAvailable}
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary to-accent py-3.5 text-base font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
            >
              <span className="relative z-10">{loading ? 'Salvataggio...' : 'Completa Registrazione →'}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
  );
}
