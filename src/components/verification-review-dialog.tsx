'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getProtectedDocumentUrl } from '@/lib/document-urls';

interface VerificationReviewDialogProps {
  verification: any;
}

export function VerificationReviewDialog({ verification }: VerificationReviewDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async (approved: boolean) => {
    if (!approved && !rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Inserisci un motivo per il rifiuto',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/identity/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationId: verification.id,
          approved,
          rejectionReason: approved ? undefined : rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante la revisione');
      }

      toast({
        title: approved ? '✅ Approvato' : '❌ Rifiutato',
        description: approved
          ? 'La verifica è stata approvata con successo'
          : 'La verifica è stata rifiutata',
      });

      setIsOpen(false);
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500"
      >
        Revisiona Documenti
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl border-white/10 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-white">
              Revisiona Documenti - {verification.user.name || 'N/A'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* User Info */}
            <div className="rounded-lg border border-white/10 bg-zinc-800/50 p-4">
              <div className="grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <span className="text-zinc-400">Nome:</span>
                  <p className="font-medium text-white">{verification.user.name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Email:</span>
                  <p className="font-medium text-white">{verification.user.email}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Telefono:</span>
                  <p className="font-medium text-white">{verification.user.phone || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-zinc-400">Data di Nascita:</span>
                  <p className="font-medium text-white">
                    {verification.user.birthDate
                      ? new Date(verification.user.birthDate).toLocaleDateString('it-IT')
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Front */}
              <div>
                <Label className="mb-2 block text-white">Fronte Documento</Label>
                <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                  <img
                    src={getProtectedDocumentUrl(verification.documentFrontUrl)}
                    alt="Fronte"
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>

              {/* Back */}
              {verification.documentBackUrl && (
                <div>
                  <Label className="mb-2 block text-white">Retro Documento</Label>
                  <div className="relative aspect-video overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                    <img
                      src={getProtectedDocumentUrl(verification.documentBackUrl)}
                      alt="Retro"
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Selfie */}
            <div>
              <Label className="mb-2 block text-white">Selfie con Documento</Label>
              <div className="relative aspect-video max-w-md overflow-hidden rounded-lg border border-white/10 bg-zinc-800">
                <img
                  src={getProtectedDocumentUrl(verification.selfieUrl)}
                  alt="Selfie"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>

            {/* Rejection Reason */}
            <div>
              <Label htmlFor="rejection-reason" className="text-white">
                Motivo Rifiuto (opzionale se approvi)
              </Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2 border-white/10 bg-zinc-800 text-white"
                placeholder="Es: Documento non leggibile, selfie non chiaro, etc."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleReview(false)}
                disabled={isSubmitting}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rifiuta
              </Button>
              <Button
                onClick={() => handleReview(true)}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
