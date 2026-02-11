import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Calendar, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { VerificationReviewDialog } from '@/components/verification-review-dialog';
import { IdentityAnalytics } from '@/components/identity-analytics';
import { PendingVerificationsSection } from '@/components/pending-verifications-section';

export const metadata: Metadata = {
  title: 'Revisione Identità | Admin',
  description: 'Revisiona le richieste di verifica identità',
};

export default async function IdentityReviewPage() {
  const session = await getServerSession(authConfig);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Get all pending verifications
  const pendingVerifications = await prisma.identityVerification.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          birthDate: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  // Get recent reviews
  const recentReviews = await prisma.identityVerification.findMany({
    where: {
      status: {
        in: ['APPROVED', 'REJECTED'],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      reviewedAt: 'desc',
    },
    take: 10,
  });

  // Stats
  const stats = await prisma.identityVerification.groupBy({
    by: ['status'],
    _count: true,
  });

  const statsMap = {
    pending: stats.find((s) => s.status === 'PENDING')?._count || 0,
    approved: stats.find((s) => s.status === 'APPROVED')?._count || 0,
    rejected: stats.find((s) => s.status === 'REJECTED')?._count || 0,
  };

  return (
    <div className="min-h-screen bg-black py-12">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Revisione Identità</h1>
              <p className="text-sm text-zinc-400">
                Gestisci le richieste di verifica degli utenti
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card className="border-yellow-500/20 bg-yellow-950/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400">In Attesa</p>
                <p className="text-3xl font-bold text-yellow-500">{statsMap.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500/50" />
            </div>
          </Card>

          <Card className="border-green-500/20 bg-green-950/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400">Approvate</p>
                <p className="text-3xl font-bold text-green-500">{statsMap.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500/50" />
            </div>
          </Card>

          <Card className="border-red-500/20 bg-red-950/20 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400">Rifiutate</p>
                <p className="text-3xl font-bold text-red-500">{statsMap.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/50" />
            </div>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">Statistiche</h2>
          <IdentityAnalytics />
        </div>

        {/* Pending Verifications with Batch Approval */}
        <PendingVerificationsSection verifications={pendingVerifications} />

        {/* Recent Reviews */}
        <Card className="border-white/10 bg-zinc-900/50 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">Revisioni Recenti</h2>

          {recentReviews.length === 0 ? (
            <Alert className="border-white/10 bg-zinc-800/50">
              <AlertDescription className="text-zinc-400">
                Nessuna revisione recente
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-zinc-800/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700">
                      <User className="h-5 w-5 text-zinc-300" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{review.user.name || 'N/A'}</p>
                      <p className="text-sm text-zinc-400">{review.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <p className="text-zinc-400">Revisionato da</p>
                      <p className="font-medium text-white">{review.reviewer?.name || 'N/A'}</p>
                    </div>
                    {review.status === 'APPROVED' ? (
                      <Badge className="bg-green-500/10 text-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Approvato
                      </Badge>
                    ) : (
                      <Badge className="bg-red-500/10 text-red-500">
                        <XCircle className="mr-1 h-3 w-3" />
                        Rifiutato
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
