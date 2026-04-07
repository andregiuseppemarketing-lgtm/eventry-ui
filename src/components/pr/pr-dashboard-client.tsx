'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import {
  Users,
  Ticket,
  CheckCircle,
  Euro,
  Calendar,
  Link2,
  Copy,
  CheckCheck,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/kpi-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EventPerformance {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventStatus: string;
  quotaTotal: number | null;
  quotaFemale: number | null;
  quotaMale: number | null;
  peopleBrought: number;
  ticketsIssued: number;
  checkins: number;
  conversionRate: number;
  revenue: number;
  quotaUsagePercent: number | null;
}

interface InviteLink {
  slug: string;
  eventTitle: string;
  eventDate: string;
  uses: number;
  maxUses: number | null;
  usagePercent: number | null;
  createdAt: string;
}

interface PrPerformanceData {
  prProfile: {
    displayName: string | null;
    referralCode: string;
  };
  aggregates: {
    totalEvents: number;
    totalPeopleBrought: number;
    totalTickets: number;
    totalCheckins: number;
    totalRevenue: number;
    avgConversionRate: number;
  };
  events: EventPerformance[];
  inviteLinks: InviteLink[];
  period: string;
}

export function PrDashboardClient() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [data, setData] = useState<PrPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Redirect se non PR
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin' as Route);
      return;
    }

    if (session.user.role !== 'PR') {
      router.push('/dashboard' as Route);
      return;
    }
  }, [session, status, router]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pr/performance?period=${period}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nel caricamento dati');
      }

      const prData = await response.json();
      setData(prData);
      setError(null);
    } catch (err) {
      console.error('Errore fetch PR dashboard:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user.role === 'PR') {
      fetchData();
    }
  }, [fetchData, status, session]);

  // Copy link handler
  const handleCopyLink = useCallback((slug: string) => {
    const fullUrl = `${window.location.origin}/eventi?invite=${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }, []);

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
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Errore</h2>
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

  const hasEvents = data.events.length > 0;
  const hasInviteLinks = data.inviteLinks.length > 0;

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
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Dashboard PR
            </h1>
            <p className="text-muted-foreground">
              {data.prProfile.displayName || 'PR'} • {data.prProfile.referralCode}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={period === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('month')}
            >
              Mese
            </Button>
            <Button
              variant={period === 'year' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod('year')}
            >
              Anno
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!hasEvents && !hasInviteLinks ? (
        <Card className="glass border-border">
          <CardContent className="py-16 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nessun evento assegnato</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Non hai ancora eventi assegnati per questo periodo.
              I tuoi eventi e le tue performance verranno mostrati qui quando l&apos;organizzatore ti assegnerà degli eventi.
            </p>
            <p className="text-sm text-muted-foreground/70 mt-4">
              Codice referral: <span className="font-mono font-semibold">{data.prProfile.referralCode}</span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Overview KPI */}
          {hasEvents && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              <KpiCard
                title="Eventi"
                value={data.aggregates.totalEvents}
                subtitle={`nel periodo`}
                icon={Calendar}
                iconColor="text-primary"
              />
              <KpiCard
                title="Persone Portate"
                value={data.aggregates.totalPeopleBrought}
                subtitle="in lista"
                icon={Users}
                iconColor="text-blue-500"
              />
              <KpiCard
                title="Ticket Emessi"
                value={data.aggregates.totalTickets}
                subtitle="convertiti"
                icon={Ticket}
                iconColor="text-green-500"
              />
              <KpiCard
                title="Check-in"
                value={data.aggregates.totalCheckins}
                subtitle={`${data.aggregates.avgConversionRate}% conversion`}
                icon={CheckCircle}
                iconColor="text-purple-500"
              />
              <KpiCard
                title="Revenue"
                value={`€${data.aggregates.totalRevenue.toFixed(0)}`}
                subtitle="da biglietti"
                icon={Euro}
                iconColor="text-yellow-500"
              />
            </div>
          )}

          {/* Eventi Assegnati */}
          {hasEvents && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">I Miei Eventi</h2>
              <Card className="glass border-border">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-sm text-muted-foreground">
                          <th className="text-left py-3 px-4">Evento</th>
                          <th className="text-right py-3 px-2">Persone</th>
                          <th className="text-right py-3 px-2">Ticket</th>
                          <th className="text-right py-3 px-2">Check-in</th>
                          <th className="text-right py-3 px-2">Conv.</th>
                          <th className="text-right py-3 px-2">Revenue</th>
                          <th className="text-right py-3 px-4">Quota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.events.map((event, index) => (
                          <tr
                            key={event.eventId}
                            className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${
                              index === 0 ? 'bg-primary/5' : ''
                            }`}
                          >
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{event.eventTitle}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(event.eventDate).toLocaleDateString('it-IT')}
                                </p>
                              </div>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="font-semibold text-blue-500">
                                {event.peopleBrought}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="font-semibold text-green-500">
                                {event.ticketsIssued}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="font-semibold text-purple-500">
                                {event.checkins}
                              </span>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="text-sm">{event.conversionRate}%</span>
                            </td>
                            <td className="text-right py-3 px-2">
                              <span className="font-semibold text-yellow-500">
                                €{event.revenue.toFixed(0)}
                              </span>
                            </td>
                            <td className="text-right py-3 px-4">
                              {event.quotaTotal ? (
                                <div className="text-sm">
                                  <span className="font-medium">
                                    {event.peopleBrought}/{event.quotaTotal}
                                  </span>
                                  {event.quotaUsagePercent !== null && (
                                    <span
                                      className={`ml-2 text-xs ${
                                        event.quotaUsagePercent >= 100
                                          ? 'text-green-500'
                                          : event.quotaUsagePercent >= 80
                                          ? 'text-yellow-500'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {event.quotaUsagePercent}%
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Link Inviti */}
          {hasInviteLinks && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Link Inviti</h2>
              <Card className="glass border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Link2 className="w-5 h-5" />
                    I Tuoi Link Invito
                  </CardTitle>
                  <CardDescription>
                    Link personalizzati per tracciare gli ingressi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.inviteLinks.map((link) => (
                      <div
                        key={link.slug}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-mono text-sm font-medium">{link.slug}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleCopyLink(link.slug)}
                            >
                              {copiedSlug === link.slug ? (
                                <CheckCheck className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-muted-foreground">{link.eventTitle}</p>
                          <p className="text-xs text-muted-foreground/70">
                            {new Date(link.eventDate).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-primary">
                            {link.uses}
                            {link.maxUses && <span className="text-muted-foreground"> / {link.maxUses}</span>}
                          </p>
                          {link.usagePercent !== null && (
                            <div className="flex items-center gap-2 mt-1">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    link.usagePercent >= 100
                                      ? 'bg-green-500'
                                      : link.usagePercent >= 80
                                      ? 'bg-yellow-500'
                                      : 'bg-primary'
                                  }`}
                                  style={{ width: `${Math.min(link.usagePercent, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {link.usagePercent}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
