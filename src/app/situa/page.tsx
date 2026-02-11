'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { 
  Users, 
  Ticket, 
  TrendingUp,
  UserCheck,
  Download,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

type EventStats = {
  totalEntries: number;
  totalTickets: number;
  totalCheckins: number;
  conversionRate: number;
  checkinRate: number;
  entriesByPR: Array<{
    prName: string;
    entries: number;
    tickets: number;
    checkins: number;
  }>;
  entriesByGender: {
    F: number;
    M: number;
    NB: number;
    UNK: number;
  };
  peakTimes: Array<{
    hour: number;
    checkins: number;
  }>;
  inviteLinks: Array<{
    id: string;
    slug: string;
    uses: number;
    maxUses: number | null;
    conversionRate: number;
    createdBy: string | null;
    prName: string | null;
  }>;
};

async function fetchEventStats(eventId: string): Promise<EventStats> {
  const res = await fetch(`/api/stats/event/${eventId}`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  const data = await res.json();
  return data.data;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function StatsCard({ title, value, icon: Icon, subtitle }: { 
  title: string; 
  value: number | string; 
  icon: React.ComponentType<{ className?: string }>; 
  subtitle?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

function SituaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('event');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['event-stats', eventId],
    queryFn: () => fetchEventStats(eventId!),
    enabled: !!eventId && !!session?.user,
    refetchInterval: 30000, // Aggiorna ogni 30 secondi
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Seleziona un Evento</CardTitle>
            <CardDescription>
              Scegli un evento dalla dashboard per visualizzare le statistiche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Vai alla Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Errore</CardTitle>
            <CardDescription>
              Impossibile caricare le statistiche dell&apos;evento
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Prepare data for charts
  const genderData = [
    { name: 'Donne', value: stats.entriesByGender.F },
    { name: 'Uomini', value: stats.entriesByGender.M },
    { name: 'Non Binario', value: stats.entriesByGender.NB },
    { name: 'Non Specificato', value: stats.entriesByGender.UNK },
  ].filter(item => item.value > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Situazione Evento</h1>
          <p className="text-muted-foreground">
            Statistiche in tempo reale
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <Calendar className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Esporta Report
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Liste Totali"
          value={stats.totalEntries}
          icon={Users}
        />
        <StatsCard
          title="Biglietti Emessi"
          value={stats.totalTickets}
          icon={Ticket}
          subtitle={`${stats.conversionRate.toFixed(1)}% conversione`}
        />
        <StatsCard
          title="Check-in Effettuati"
          value={stats.totalCheckins}
          icon={UserCheck}
          subtitle={`${stats.checkinRate.toFixed(1)}% dei biglietti`}
        />
        <StatsCard
          title="Tasso Conversione"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          subtitle="Lista → Biglietto"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* PR Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance PR</CardTitle>
            <CardDescription>Liste, biglietti e check-in per PR</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.entriesByPR}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="prName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entries" fill="#8884d8" name="Liste" />
                <Bar dataKey="tickets" fill="#82ca9d" name="Biglietti" />
                <Bar dataKey="checkins" fill="#ffc658" name="Check-in" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuzione per Genere</CardTitle>
            <CardDescription>Composizione liste ospiti</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: { name?: string; percent?: number }) => 
                    `${name || ''} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Peak Times */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Orari di Punta Check-in</CardTitle>
          <CardDescription>Distribuzione degli ingressi per ora</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.peakTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="hour" 
                tickFormatter={(hour) => `${hour}:00`}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(hour) => `Ore ${hour}:00`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="checkins" 
                stroke="#8884d8" 
                name="Check-in"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Invite Links Performance */}
      {stats.inviteLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Link Invito</CardTitle>
            <CardDescription>Utilizzo dei link di invito condivisi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.inviteLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium">/{link.slug}</div>
                    <div className="text-sm text-muted-foreground">
                      Creato da: {link.createdBy}
                      {link.prName && ` • PR: ${link.prName}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">
                      {link.uses}
                      {link.maxUses && ` / ${link.maxUses}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {link.conversionRate}% utilizzo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function SituaPageWrapper() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Caricamento statistiche...</p>
          </div>
        </div>
      </div>
    }>
      <SituaPage />
    </Suspense>
  );
}
