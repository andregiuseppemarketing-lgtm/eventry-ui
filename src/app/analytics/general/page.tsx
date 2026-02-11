'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { 
  Users, 
  Euro, 
  Calendar,
  TrendingUp,
  Award,
  BarChart3,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { PieChart } from '@/components/dashboard/pie-chart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';

interface GeneralDashboardData {
  period: {
    type: string;
    month: number | null;
    year: number;
    startDate: Date;
    endDate: Date;
  };
  overview: {
    totalEvents: number;
    totalEntries: number;
    totalRevenue: number;
    avgEntriesPerEvent: number;
    avgRevenuePerEvent: number;
    avgRevenuePerPerson: number;
    totalNewCustomers: number;
    totalReturningCustomers: number;
    avgGroupSize: number;
  };
  eventsBreakdown: Array<{
    eventId: string;
    eventTitle: string;
    eventDate: Date;
    entries: number;
    revenue: number;
    newCustomers: number;
  }>;
  timeline: Array<{
    date: string;
    entries: number;
  }>;
  audience: {
    ageDistribution: Record<string, number>;
    avgAge: number | null;
    topCities: Array<{ city: string; count: number }>;
    outOfTownPercentage: number;
  };
  monetization: {
    totalRevenue: number;
    ticketTypeDistribution: Record<string, number>;
    revenueByType: Record<string, number>;
  };
  topEvents: Array<{
    id: string;
    title: string;
    date: Date;
    entries: number;
    revenue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    entries: number;
    revenue: number;
  }>;
}

const MONTHS = [
  'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
];

export default function GeneralDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<GeneralDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentDate = new Date();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

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
      const params = new URLSearchParams({
        period,
        month: selectedMonth.toString(),
        year: selectedYear.toString(),
      });

      const response = await fetch(`/api/dashboard/general?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel caricamento dati');
      }

      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      console.error('Errore fetch dashboard generale:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [period, selectedMonth, selectedYear]);

  useEffect(() => {
    if (status === 'authenticated' && ['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      fetchData();
    }
  }, [fetchData, status, session]);

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

  const periodLabel = period === 'month' 
    ? `${MONTHS[selectedMonth - 1]} ${selectedYear}`
    : period === 'year'
    ? `Anno ${selectedYear}`
    : 'Tutti i periodi';

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
              Dashboard Generale
            </h1>
            <p className="text-muted-foreground">
              Analisi aggregata di tutti gli eventi - {periodLabel}
            </p>
          </div>

          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Aggiorna
          </Button>
        </div>
      </div>

      {/* Filtri Periodo */}
      <Card className="glass border-border mb-6">
        <CardHeader>
          <CardTitle>Periodo di Analisi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm text-muted-foreground block mb-1">
                Tipo Periodo
              </label>
              <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Mese</SelectItem>
                  <SelectItem value="year">Anno</SelectItem>
                  <SelectItem value="all">Tutti</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {period === 'month' && (
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Mese
                </label>
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(v) => setSelectedMonth(parseInt(v))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month, idx) => (
                      <SelectItem key={idx} value={(idx + 1).toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {(period === 'month' || period === 'year') && (
              <div>
                <label className="text-sm text-muted-foreground block mb-1">
                  Anno
                </label>
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(v) => setSelectedYear(parseInt(v))}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Overview KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Eventi Totali"
          value={data.overview.totalEvents}
          icon={Calendar}
          iconColor="text-purple-500"
        />
        <KpiCard
          title="Ingressi Totali"
          value={data.overview.totalEntries}
          subtitle={`Media ${data.overview.avgEntriesPerEvent.toFixed(0)}/evento`}
          icon={Users}
          iconColor="text-primary"
        />
        <KpiCard
          title="Incasso Totale"
          value={`€${data.overview.totalRevenue.toFixed(0)}`}
          subtitle={`Media €${data.overview.avgRevenuePerEvent.toFixed(0)}/evento`}
          icon={Euro}
          iconColor="text-yellow-500"
        />
        <KpiCard
          title="Nuovi Clienti"
          value={data.overview.totalNewCustomers}
          subtitle={`${data.overview.totalReturningCustomers} ritorno`}
          icon={TrendingUp}
          iconColor="text-green-500"
        />
      </div>

      {/* Top Eventi */}
      {data.topEvents.length > 0 && (
        <Card className="glass border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Top 5 Eventi del Periodo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topEvents.map((event, idx) => (
                <Link
                  key={event.id}
                  href={`/analytics/${event.id}` as Route}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-muted-foreground">
                        #{idx + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {event.entries} ingressi
                      </p>
                      <p className="text-sm text-green-500">
                        €{event.revenue.toFixed(0)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trend Mensile */}
      {data.monthlyTrend.length > 0 && (
        <Card className="glass border-border mb-8">
          <CardHeader>
            <CardTitle>Trend Mensile</CardTitle>
            <CardDescription>Andamento ingressi e incassi per mese</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.monthlyTrend.map((item, idx) => {
                const maxEntries = Math.max(...data.monthlyTrend.map(m => m.entries));
                const width = maxEntries > 0 ? (item.entries / maxEntries) * 100 : 0;
                
                return (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">
                      {item.month}
                    </span>
                    <div className="flex-1">
                      <div className="relative h-8 bg-muted/20 rounded-lg overflow-hidden">
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-primary rounded-lg transition-all"
                          style={{ width: `${width}%` }}
                        />
                        <div className="absolute inset-0 flex items-center px-3 justify-between">
                          <span className="text-xs font-medium text-white">
                            {item.entries} ingressi
                          </span>
                          <span className="text-xs font-medium text-white">
                            €{item.revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analisi Pubblico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Età */}
        <PieChart
          title="Distribuzione per Età (Aggregata)"
          description={data.audience.avgAge ? `Età media: ${data.audience.avgAge.toFixed(1)} anni` : undefined}
          data={Object.entries(data.audience.ageDistribution).map(([label, value]) => ({
            label,
            value,
          }))}
        />

        {/* Città */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle>Top 10 Città</CardTitle>
            <CardDescription>
              {data.audience.outOfTownPercentage.toFixed(1)}% fuori città principale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.audience.topCities.map((city, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/20"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium">{city.city}</span>
                  </div>
                  <span className="text-primary font-semibold">{city.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monetizzazione */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* Tutti gli Eventi del Periodo */}
      {data.eventsBreakdown.length > 0 && (
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tutti gli Eventi del Periodo ({data.eventsBreakdown.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.eventsBreakdown.map((event) => (
                <Link
                  key={event.eventId}
                  href={`/analytics/${event.eventId}` as Route}
                  className="block"
                >
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div>
                      <h3 className="font-medium">{event.eventTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.eventDate).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {event.entries} ingressi
                      </p>
                      <p className="text-sm text-green-500">
                        €{event.revenue.toFixed(0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.newCustomers} nuovi
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
