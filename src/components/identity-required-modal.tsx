'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

interface IdentityRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'lista' | 'ticket' | 'pr' | 'venue' | 'organization';
}

const actionMessages = {
  lista: {
    title: 'Verifica Identità Richiesta',
    description: 'Per accedere alle liste eventi devi verificare la tua identità. Questo ci aiuta a garantire la sicurezza di tutti gli utenti.',
  },
  ticket: {
    title: 'Verifica Identità Richiesta',
    description: 'Per acquistare biglietti devi verificare la tua identità. È un requisito obbligatorio per legge.',
  },
  pr: {
    title: 'Verifica Identità Richiesta',
    description: 'Per diventare PR devi verificare la tua identità. Devi avere almeno 18 anni e un documento valido.',
  },
  venue: {
    title: 'Verifica Identità Richiesta',
    description: 'Per creare e gestire venue devi verificare la tua identità. Devi avere almeno 21 anni.',
  },
  organization: {
    title: 'Verifica Identità Richiesta',
    description: 'Per creare un\'organizzazione devi verificare la tua identità. Devi avere almeno 18 anni.',
  },
};

export function IdentityRequiredModal({ isOpen, onClose, action }: IdentityRequiredModalProps) {
  const router = useRouter();
  const message = actionMessages[action];

  const handleGoToVerification = () => {
    onClose();
    router.push('/verifica-identita' as Route);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <DialogTitle className="text-center">{message.title}</DialogTitle>
          <DialogDescription className="text-center">
            {message.description}
          </DialogDescription>
        </DialogHeader>

        <Alert className="border-yellow-500/20 bg-yellow-950/20">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm text-yellow-400">
            Il processo di verifica richiede:
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Documento d&apos;identità (fronte e retro)</li>
              <li>Selfie con il documento</li>
              <li>Revisione manuale (24-48h)</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Annulla
          </Button>
          <Button
            onClick={handleGoToVerification}
            className="flex-1 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500"
          >
            Verifica Ora
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
