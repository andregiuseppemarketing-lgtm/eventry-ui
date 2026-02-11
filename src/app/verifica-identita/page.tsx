import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { IdentityVerificationUpload } from '@/components/identity-verification-upload';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Verifica Identità | Panico App',
  description: 'Verifica la tua identità per accedere a tutte le funzionalità',
};

export default async function IdentityVerificationPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    redirect('/auth/login');
  }

  // Get user's verification requests
  const verifications = await prisma.identityVerification.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      documentType: true,
      status: true,
      createdAt: true,
      reviewedAt: true,
      rejectionReason: true,
    },
  });

  const latestVerification = verifications[0];
  const isVerified = session.user.identityVerified;

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-violet-600">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Verifica Identità</h1>
          <p className="mt-2 text-zinc-400">
            Completa la verifica per accedere a tutte le funzionalità dell&apos;app
          </p>
        </div>

        {/* Status Alert */}
        {isVerified && (
          <Alert className="mb-6 border-green-500/20 bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-400">
              ✅ La tua identità è stata verificata con successo!
            </AlertDescription>
          </Alert>
        )}

        {latestVerification && !isVerified && (
          <>
            {latestVerification.status === 'PENDING' && (
              <Alert className="mb-6 border-yellow-500/20 bg-yellow-950/20">
                <Clock className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  ⏳ La tua richiesta è in fase di revisione. Riceverai una notifica a breve.
                </AlertDescription>
              </Alert>
            )}

            {latestVerification.status === 'REJECTED' && (
              <Alert className="mb-6 border-red-500/20 bg-red-950/20">
                <XCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  ❌ La tua richiesta è stata rifiutata.
                  {latestVerification.rejectionReason && (
                    <div className="mt-2">
                      <strong>Motivo:</strong> {latestVerification.rejectionReason}
                    </div>
                  )}
                  <div className="mt-2">Puoi inviare una nuova richiesta qui sotto.</div>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Why Verify */}
        <Card className="mb-6 border-white/10 bg-zinc-900/50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-white">Perché verificare la tua identità?</h2>
          <ul className="space-y-3 text-sm text-zinc-300">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>Accedi alle liste eventi e acquista biglietti</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>Diventa PR e guadagna sugli ingressi</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>Crea e gestisci venue ed eventi</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
              <span>Maggiore sicurezza per tutti gli utenti</span>
            </li>
          </ul>
        </Card>

        {/* Upload Form */}
        {!isVerified && latestVerification?.status !== 'PENDING' && (
          <Card className="border-white/10 bg-zinc-900/50 p-6">
            <h2 className="mb-6 text-xl font-semibold text-white">Carica Documenti</h2>
            <IdentityVerificationUpload />
          </Card>
        )}

        {/* History */}
        {verifications.length > 0 && (
          <Card className="mt-6 border-white/10 bg-zinc-900/50 p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Storico Richieste</h2>
            <div className="space-y-3">
              {verifications.map((verification) => (
                <div
                  key={verification.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-800/50 p-4"
                >
                  <div>
                    <div className="font-medium text-white">
                      {verification.documentType === 'ID_CARD' && 'Carta d\'Identità'}
                      {verification.documentType === 'PASSPORT' && 'Passaporto'}
                      {verification.documentType === 'DRIVER_LICENSE' && 'Patente'}
                    </div>
                    <div className="text-sm text-zinc-400">
                      {new Date(verification.createdAt).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <div>
                    {verification.status === 'PENDING' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-500">
                        <Clock className="h-3 w-3" />
                        In Revisione
                      </span>
                    )}
                    {verification.status === 'APPROVED' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500">
                        <CheckCircle2 className="h-3 w-3" />
                        Approvato
                      </span>
                    )}
                    {verification.status === 'REJECTED' && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-500">
                        <XCircle className="h-3 w-3" />
                        Rifiutato
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* GDPR Notice */}
        <Alert className="mt-6 border-white/10 bg-zinc-900/50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs text-zinc-400">
            <strong>Privacy e Sicurezza:</strong> I tuoi documenti sono criptati e visualizzati solo
            dal team di verifica. Vengono automaticamente eliminati dopo 90 giorni dall&apos;approvazione,
            in conformità con il GDPR. Non vengono mai condivisi con terze parti.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
