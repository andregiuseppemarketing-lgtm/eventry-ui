/**
 * MILESTONE 7 - ADMIN BACKOFFICE
 * /admin - Dashboard Generale
 * Accesso: Solo ADMIN
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

async function getDashboardData() {
  const [
    totalUsers,
    totalEvents,
    activeEvents,
    totalTickets,
    totalCheckins,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.count({
      where: {
        status: 'PUBLISHED',
        dateStart: { gte: new Date() },
      },
    }),
    prisma.ticket.count(),
    prisma.ticket.count({
      where: { status: 'CHECKED_IN' },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalEvents,
    activeEvents,
    totalTickets,
    totalCheckins,
    recentAuditLogs,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  // ⚠️ SECURITY: Solo ADMIN
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  const data = await getDashboardData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🔒 Admin Backoffice</h1>
          <p className="text-muted-foreground mt-1">
            Dashboard amministrativa - Accesso riservato
          </p>
        </div>
        <Badge variant="destructive" className="text-sm">
          ADMIN ONLY
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utenti Totali</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registrati sulla piattaforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventi Attivi</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeEvents}</div>
            <p className="text-xs text-muted-foreground">
              di {data.totalEvents} totali
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Emessi</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Biglietti generati
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Check-in</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalCheckins}</div>
            <p className="text-xs text-muted-foreground">
              Biglietti validati
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/users">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                User Management
              </CardTitle>
              <CardDescription>
                Gestisci utenti, ruoli e permessi
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/events">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                Event Management
              </CardTitle>
              <CardDescription>
                Controlla eventi e stato pubblicazione
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/tickets">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
                Ticket Control
              </CardTitle>
              <CardDescription>
                Ricerca e gestisci biglietti
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/emails">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                Email Center
              </CardTitle>
              <CardDescription>
                Log email e gestione comunicazioni
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer">
          <Link href="/admin/system">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                System Health
              </CardTitle>
              <CardDescription>
                Monitora stato sistema e infrastruttura
              </CardDescription>
            </CardHeader>
          </Link>
        </Card>
      </div>

      {/* Recent Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Ultime Azioni Admin</CardTitle>
          <CardDescription>
            Log delle ultime 10 operazioni amministrative
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.recentAuditLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nessuna azione amministrativa recente
            </p>
          ) : (
            <div className="space-y-3">
              {data.recentAuditLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between border-b pb-3 last:border-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {log.entity}
                      </Badge>
                      <span className="text-sm font-medium">{log.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.user.firstName} {log.user.lastName} ({log.user.email})
                    </p>
                    {log.details && (
                      <p className="text-xs text-muted-foreground">
                        ID: {log.entityId}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true,
                      locale: it,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link href="/dashboard">
            ← Torna alla Dashboard Utente
          </Link>
        </Button>
      </div>
    </div>
  );
}
