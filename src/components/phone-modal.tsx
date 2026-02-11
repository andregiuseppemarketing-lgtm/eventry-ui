'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface PhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PhoneModal({ isOpen, onClose }: PhoneModalProps) {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/update-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      if (!res.ok) {
        throw new Error('Errore durante il salvataggio');
      }

      onClose();
      router.refresh();
    } catch {
      setError('Impossibile salvare il numero di telefono');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md mx-4">
        {/* Card glassmorphic */}
        <div className="relative rounded-2xl glass border border-border p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Bordo luminoso */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50 pointer-events-none" />
          
          <div className="relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight gradient-text">Completa il profilo</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Inserisci il tuo numero di telefono per continuare
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-accent/10 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-foreground">
                  Numero di telefono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+39 123 456 7890"
                  className="w-full rounded-lg border border-border bg-card/50 backdrop-blur-sm px-4 py-3 text-foreground placeholder:text-muted-foreground transition-all duration-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:shadow-[0_0_20px_hsl(var(--primary)/0.2)]"
                />
                <p className="text-xs text-muted-foreground">
                  Il tuo numero sarà utilizzato per comunicazioni relative agli eventi
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-ghost flex-1"
                  disabled={loading}
                >
                  Salta
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
