'use client';

import { use, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { 
  Users, 
  UserPlus, 
  Euro, 
  Clock, 
  UsersRound,
  TrendingUp,
  Calendar,
  MapPin,
  RefreshCw,
  Filter,
  Download,
  ArrowLeft
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { TimelineChart } from '@/components/dashboard/timeline-chart';
import { PieChart } from '@/components/dashboard/pie-chart';
import { PrPerformanceTable } from '@/components/dashboard/pr-performance-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface DashboardData {
  event: {
    id: string;
    title: string;
    date: Date;
    venue: string | null;
  };
  overview: {
    totalEntries: number;
    newCustomers: number;
    returningCustomers: number;
    totalRevenue: number;
    avgRevenuePerPerson: number;
    avgGroupSize: number;
    peakTimeSlot: string;
    peakCount: number;
  };
  timeline: Array<{
    time: string;
    entries: number;
    cumulative: number;
  }>;
  audience: {
    ageDistribution: Record<string, number>;
    avgAge: number | null;
    genderDistribution: Record<string, number>;
    topCities: Array<{ city: string; count: number }>;
    outOfTownPercentage: number;
  };
  prPerformance: Array<{
    prName: string;
    prInstagram: string | null;
    entries: number;
    revenue: number;
    avgGroupSize: number;
    tickets: {
      lista: number;
      tavolo: number;
      prevendita: number;
      omaggio: number;
    };
  }>;
  topPr: {
    name: string;
    instagram: string | null;
    entries: number;
    percentage: number;
  } | null;
  monetization: {
    totalRevenue: number;
    ticketTypeDistribution: Record<string, number>;
    ticketTypePercentages: Record<string, number>;
    revenueByType: Record<string, number>;
  };
}

export default function EventDashboardPage({ 
  params 
}: { 
  params: Promise<{ eventId: string }> 
}) {
  const unwrappedParams = use(params);
  const eventId = unwrappedParams.eventId;

  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Filtri
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedPrId, setSelectedPrId] = useState('');

  // Verifica permessi
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin' as Route);
      return;
    }

    if (!['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      router.push('/dashboard' as Route);
      return;
    }
  }, [session, status, router]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startTime) params.append('startTime', startTime);
      if (endTime) params.append('endTime', endTime);
      if (selectedPrId) params.append('prId', selectedPrId);

      const url = `/api/dashboard/evento/${eventId}${params.toString() ? `?${params}` : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel caricamento dati');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Errore fetch dashboard:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [eventId, startTime, endTime, selectedPrId]);

  useEffect(() => {
    if (status === 'authenticated' && session && ['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      fetchData();
    }
  }, [fetchData, status, session]);

  // Auto-refresh ogni 30 secondi
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // 30 secondi

    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Caricamento dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Errore</h2>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchData} className="mt-4">
              Riprova
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Indietro
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              {data.event.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(data.event.date).toLocaleDateString('it-IT')}</span>
              </div>
              {data.event.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{data.event.venue}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'border-primary' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Esporta Report
            </Button>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <Card className="glass border-border mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Orario inizio
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="px-3 py-2 bg-muted/20 border border-border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Orario fine
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="px-3 py-2 bg-muted/20 border border-border rounded-md text-sm"
              />
            </div>
            {startTime || endTime ? (
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStartTime('');
                    setEndTime('');
                  }}
                >
                  Reset filtri
                </Button>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* ===== A. OVERVIEW KPI ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Ingressi Totali"
          value={data.overview.totalEntries}
          icon={Users}
          iconColor="text-primary"
        />
        <KpiCard
          title="Nuovi Clienti"
          value={data.overview.newCustomers}
          subtitle={`${data.overview.returningCustomers} ritorno`}
          icon={UserPlus}
          iconColor="text-green-500"
        />
        <KpiCard
          title="Incasso Totale"
          value={`€${data.overview.totalRevenue.toFixed(0)}`}
          subtitle={`€${data.overview.avgRevenuePerPerson.toFixed(2)}/persona`}
          icon={Euro}
          iconColor="text-yellow-500"
        />
        <KpiCard
          title="Orario di Picco"
          value={data.overview.peakTimeSlot}
          subtitle={`${data.overview.peakCount} ingressi`}
          icon={Clock}
          iconColor="text-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard
          title="Gruppo Medio"
          value={data.overview.avgGroupSize.toFixed(1)}
          subtitle="persone per prenotazione"
          icon={UsersRound}
          iconColor="text-purple-500"
        />
        {data.topPr && (
          <div className="md:col-span-2">
            <KpiCard
              title="🏆 Top PR della Serata"
              value={data.topPr.name}
              subtitle={`${data.topPr.entries} ingressi (${data.topPr.percentage}%)`}
              icon={TrendingUp}
              iconColor="text-yellow-500"
            />
          </div>
        )}
      </div>

      {/* ===== B. TIMELINE INGRESSI ===== */}
      <div className="mb-8">
        <TimelineChart
          title="Andamento Ingressi"
          description="Timeline ingressi per fascia oraria (30 minuti)"
          data={data.timeline}
          showCumulative={true}
        />
      </div>

      {/* ===== C. ANALISI PUBBLICO ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Analisi Pubblico</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Età */}
          <PieChart
            title="Distribuzione per Età"
            description={data.audience.avgAge ? `Età media: ${data.audience.avgAge} anni` : undefined}
            data={Object.entries(data.audience.ageDistribution).map(([label, value]) => ({
              label,
              value,
            }))}
          />

          {/* Città */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Top Città</CardTitle>
              <CardDescription>
                {data.audience.outOfTownPercentage}% fuori città
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.audience.topCities.map((city, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                  >
                    <span className="font-medium">{city.city}</span>
                    <span className="text-primary font-semibold">{city.count}</span>
                  </div>
                ))}
                {data.audience.topCities.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    Dati città non disponibili
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===== D. PERFORMANCE PR ===== */}
      <div className="mb-8">
        <PrPerformanceTable
          title="Performance PR"
          description="Classifica PR per numero di ingressi portati"
          data={data.prPerformance}
          totalEntries={data.overview.totalEntries}
        />
      </div>

      {/* ===== E. MONETIZZAZIONE ===== */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Monetizzazione</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribuzione tipologie */}
          <PieChart
            title="Distribuzione Tipologie Ticket"
            data={Object.entries(data.monetization.ticketTypeDistribution).map(([label, value]) => ({
              label: label.charAt(0).toUpperCase() + label.slice(1),
              value,
            }))}
          />

          {/* Incassi per tipologia */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>Incasso per Tipologia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(data.monetization.revenueByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, revenue]) => (
                    <div
                      key={type}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                    >
                      <span className="font-medium capitalize">{type}</span>
                      <span className="text-green-500 font-semibold">
                        €{revenue.toFixed(0)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
