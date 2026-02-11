/**
 * Batch Approval Component
 * Selezione multipla e approvazione batch di verifiche
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BatchApprovalProps {
  verifications: Array<{
    id: string;
    user: {
      name: string | null;
      email: string;
    };
  }>;
}

export function BatchApprovalControls({ verifications }: BatchApprovalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectAll = () => {
    if (selectedIds.length === verifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(verifications.map(v => v.id));
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const handleBatchApprove = async () => {
    if (selectedIds.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Seleziona almeno una verifica',
      });
      return;
    }

    if (selectedIds.length > 10) {
      toast({
        variant: 'destructive',
        title: 'Errore',
        description: 'Massimo 10 verifiche per batch',
      });
      return;
    }

    setIsDialogOpen(true);
  };

  const confirmBatchApprove = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/identity/batch-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verificationIds: selectedIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore durante l\'approvazione batch');
      }

      toast({
        title: '✅ Batch Approvato',
        description: `${data.results.approved} verifiche approvate con successo`,
        duration: 5000,
      });

      setSelectedIds([]);
      setIsDialogOpen(false);
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

  if (verifications.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <Button
          onClick={handleSelectAll}
          variant="outline"
          size="sm"
          className="border-white/10 bg-zinc-800 text-white hover:bg-zinc-700"
        >
          {selectedIds.length === verifications.length ? 'Deseleziona Tutto' : 'Seleziona Tutto'}
        </Button>

        {selectedIds.length > 0 && (
          <>
            <span className="text-sm text-zinc-400">
              {selectedIds.length} selezionat{selectedIds.length === 1 ? 'a' : 'e'}
            </span>

            <Button
              onClick={handleBatchApprove}
              size="sm"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approva Selezionate ({selectedIds.length})
            </Button>
          </>
        )}
      </div>

      {/* Render checkboxes for each verification */}
      <div className="space-y-4">
        {verifications.map((verification) => (
          <div
            key={verification.id}
            className={`flex items-start gap-3 rounded-lg border p-4 transition-colors ${
              selectedIds.includes(verification.id)
                ? 'border-green-500/50 bg-green-950/20'
                : 'border-white/10 bg-zinc-800/50'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(verification.id)}
              onChange={() => handleToggleSelection(verification.id)}
              className="mt-1 h-5 w-5 cursor-pointer rounded border-white/20 bg-zinc-900 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0"
            />
            
            <div className="flex-1">
              <p className="font-medium text-white">
                {verification.user.name || 'N/A'}
              </p>
              <p className="text-sm text-zinc-400">{verification.user.email}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-white/10 bg-zinc-900">
          <DialogHeader>
            <DialogTitle className="text-white">Conferma Approvazione Batch</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-zinc-300">
              Stai per approvare <strong className="text-white">{selectedIds.length}</strong> verific{selectedIds.length === 1 ? 'a' : 'he'}:
            </p>

            <div className="max-h-60 space-y-2 overflow-y-auto rounded-lg border border-white/10 bg-zinc-800/50 p-3">
              {verifications
                .filter(v => selectedIds.includes(v.id))
                .map(v => (
                  <div key={v.id} className="text-sm text-zinc-300">
                    • {v.user.name || 'N/A'} ({v.user.email})
                  </div>
                ))}
            </div>

            <div className="rounded-lg border border-yellow-500/30 bg-yellow-950/20 p-3">
              <p className="text-sm text-yellow-200">
                <strong>Nota:</strong> Le verifiche verranno approvate automaticamente e gli utenti riceveranno una email di conferma.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsDialogOpen(false)}
                variant="outline"
                disabled={isSubmitting}
                className="flex-1 border-white/10 bg-zinc-800"
              >
                Annulla
              </Button>
              <Button
                onClick={confirmBatchApprove}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approvazione...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Conferma Approvazione
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
