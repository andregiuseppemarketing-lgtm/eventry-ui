'use client';

import { Button } from '@/components/ui/button';
import { Calendar, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface EventEmptyStateProps {
  isOwner: boolean;
}

/**
 * Empty State curato per tab Eventi
 * Differenzia owner (invita a creare) da visitatore (suggerisce esplorazione)
 */
export function EventEmptyState({ isOwner }: EventEmptyStateProps) {
  if (isOwner) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Visual */}
        <div className="mb-6">
          <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Calendar className="w-12 h-12 text-primary" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold mb-2">Inizia la tua avventura</h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          Crea il tuo primo evento o partecipa a quelli della community per costruire la tua storia
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="min-w-[160px]">
            <Link href="/eventi/nuovo">
              <Sparkles className="w-4 h-4 mr-2" />
              Crea Evento
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="min-w-[160px]">
            <Link href="/eventi">
              <Calendar className="w-4 h-4 mr-2" />
              Esplora Eventi
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Visitatore
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Visual */}
      <div className="mb-6">
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          <Calendar className="w-12 h-12 text-muted-foreground" />
        </div>
      </div>

      {/* Text */}
      <h3 className="text-xl font-bold mb-2">Nessun evento ancora</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Questo utente non ha ancora partecipato a eventi pubblici
      </p>

      {/* CTA */}
      <Button asChild variant="outline" size="lg">
        <Link href="/eventi">
          <Calendar className="w-4 h-4 mr-2" />
          Scopri Eventi
        </Link>
      </Button>
    </div>
  );
}
