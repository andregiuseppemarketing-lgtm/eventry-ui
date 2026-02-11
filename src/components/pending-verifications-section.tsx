/**
 * Pending Verifications Section (Client Component)
 * Wrapper per gestire batch selection
 */

'use client';

import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, User } from 'lucide-react';
import { VerificationReviewDialog } from '@/components/verification-review-dialog';
import { BatchApprovalControls } from '@/components/batch-approval-controls';

interface PendingVerificationsSectionProps {
  verifications: any[];
}

export function PendingVerificationsSection({ verifications }: PendingVerificationsSectionProps) {
  const documentTypeLabels = {
    ID_CARD: 'Carta d\'Identità',
    PASSPORT: 'Passaporto',
    DRIVER_LICENSE: 'Patente',
  };

  return (
    <Card className="mb-8 border-white/10 bg-zinc-900/50 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Richieste in Attesa ({verifications.length})
      </h2>

      {verifications.length === 0 ? (
        <Alert className="border-white/10 bg-zinc-800/50">
          <AlertDescription className="text-zinc-400">
            Nessuna richiesta in attesa di revisione
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <BatchApprovalControls verifications={verifications} />

          <div className="mt-4 space-y-4">
            {verifications.map((verification) => (
              <div
                key={verification.id}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-800/50 p-4"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-white">
                      {verification.user.name || 'N/A'}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {verification.user.email}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {documentTypeLabels[verification.documentType as keyof typeof documentTypeLabels]}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(verification.createdAt).toLocaleDateString('it-IT')}
                    </div>
                  </div>
                </div>

                <div>
                  <VerificationReviewDialog verification={verification} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
