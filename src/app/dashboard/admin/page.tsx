/**
 * Admin Dashboard - Gestione completa del sistema
 * Accesso: Solo ADMIN
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

async function getAdminStats() {
  const [
    totalUsers,
    totalEvents,
    totalTickets,
    totalRevenue,
    recentUsers,
    recentEvents,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.ticket.count(),
    prisma.ticket.aggregate({
      _sum: { price: true },
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.event.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        dateStart: true,
        status: true,
        createdAt: true,
        createdBy: {
          select: {
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
    totalTickets,
    totalRevenue: totalRevenue._sum.price || 0,
    recentUsers,
    recentEvents,
  };
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const stats = await getAdminStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          🛠️ Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestione completa del sistema EVENTRY
        </p>
      </div>

      {/* Stats Overview */}
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
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventi Totali</CardTitle>
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
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Totali</CardTitle>
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
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Totale</CardTitle>
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
              <line x1="12" x2="12" y1="2" y2="22" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">👥 Utenti</TabsTrigger>
          <TabsTrigger value="events">🎉 Eventi</TabsTrigger>
          <TabsTrigger value="system">⚙️ Sistema</TabsTrigger>
          <TabsTrigger value="database">🗄️ Database</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Utenti</CardTitle>
              <CardDescription>
                Visualizza, modifica ed elimina utenti del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserManagement users={stats.recentUsers} totalCount={stats.totalUsers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Eventi</CardTitle>
              <CardDescription>
                Gestisci tutti gli eventi della piattaforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {stats.recentEvents.length} eventi recenti
                </p>
                <div className="space-y-2">
                  {stats.recentEvents.map((event) => (
                    <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.dateStart).toLocaleDateString('it-IT')} • {event.status}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/events/${event.id}`}>Visualizza</a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next.js:</span>
                  <span className="font-medium">16.0.7</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">React:</span>
                  <span className="font-medium">19.2.1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Prisma:</span>
                  <span className="font-medium">6.19.0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Database:</span>
                  <span className="font-medium">PostgreSQL (Neon)</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Servizi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stripe:</span>
                  <Badge variant="secondary">✓ Attivo</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Resend Email:</span>
                  <Badge variant="secondary">✓ Attivo</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NextAuth:</span>
                  <Badge variant="secondary">✓ Attivo</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Prisma Studio</CardTitle>
                <CardDescription>
                  Interfaccia GUI completa per gestire il database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Apri Prisma Studio per visualizzare e modificare tutti i dati del database.
                </p>
                <code className="text-xs bg-muted px-2 py-1 rounded">./start-admin.sh</code>
                <p className="text-xs text-muted-foreground mt-2">
                  Oppure: <code className="bg-muted px-1 rounded">npx prisma studio</code>
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Script CLI</CardTitle>
                <CardDescription>
                  Script per operazioni avanzate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm space-y-1">
                  <p className="font-medium">Comandi disponibili:</p>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">
                    npx tsx scripts/list-users.ts
                  </code>
                  <code className="block bg-muted px-2 py-1 rounded text-xs">
                    npx tsx scripts/delete-user.ts [email]
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
