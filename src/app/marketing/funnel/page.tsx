'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface FunnelStep {
  step: string;
  sessions: number;
  conversionRate: number;
  dropOffRate: number;
}

interface Source {
  source: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

interface Campaign {
  campaign: string;
  sessions: number;
  conversions: number;
  conversionRate: number;
}

interface AbandonedCart {
  sessionId: string;
  email?: string;
  phone?: string;
  source?: string;
  lastStep: string;
  lastActivity: Date;
  timeSinceLastActivity: number;
}

export default function MarketingFunnelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [funnelData, setFunnelData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    } else if (session?.user) {
      const allowedRoles = ['ADMIN', 'ORGANIZER'];
      if (!allowedRoles.includes(session.user.role)) {
        router.push('/dashboard' as Route);
      }
    }
  }, [session, status, router]);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events?limit=100');
        console.log('API Response status:', res.status);
        if (res.ok) {
          const data = await res.json();
          console.log('API Response data:', data);
          // L'API ritorna { ok: true, data: { events: [], pagination: {} } }
          const eventsArray = data.data?.events || data.events || [];
          console.log('Events array:', eventsArray, 'Length:', eventsArray.length);
          setEvents(eventsArray);
          if (eventsArray.length > 0 && !selectedEventId) {
            setSelectedEventId(eventsArray[0].id);
          }
        } else {
          console.error('API error response:', await res.text());
        }
      } catch (error) {
        console.error('Errore caricamento eventi:', error);
        setEvents([]);
      }
    };

    console.log('Session:', session);
    if (session) {
      fetchEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Fetch funnel data
  const fetchFunnelData = useCallback(async () => {
    if (!selectedEventId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/funnel/events/${selectedEventId}`);
      if (res.ok) {
        const data = await res.json();
        setFunnelData(data);
      }
    } catch (error) {
      console.error('Errore caricamento funnel:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedEventId]);

  useEffect(() => {
    fetchFunnelData();
  }, [fetchFunnelData]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-6 flex items-center justify-center">
        <div className="text-purple-400">Caricamento...</div>
      </div>
    );
  }

  const getStepLabel = (step: string) => {
    const labels: Record<string, string> = {
      view: 'Visualizzazione',
      click: 'Click su Link',
      form_start: 'Form Iniziato',
      form_complete: 'Form Completato',
      ticket_issued: 'Biglietto Emesso',
    };
    return labels[step] || step;
  };

  const formatTimeSince = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) {
      const minutes = Math.floor(ms / (1000 * 60));
      return `${minutes}m fa`;
    }
    if (hours < 24) return `${hours}h fa`;
    const days = Math.floor(hours / 24);
    return `${days}g fa`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-950/20 to-black p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <button
            onClick={() => router.back()}
            className="mb-3 sm:mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Indietro
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
            Funnel Marketing
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Analisi conversioni e ottimizzazione campagne
          </p>
        </div>

        {/* Event Selector */}
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
            Evento
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full md:w-96 px-3 sm:px-4 py-2 text-sm sm:text-base bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {Array.isArray(events) && events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} -{' '}
                {new Date(event.dateStart).toLocaleDateString('it-IT')}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-sm sm:text-base">Caricamento...</div>
        ) : !funnelData ? (
          <div className="text-center py-12 text-gray-400 text-sm sm:text-base">
            Seleziona un evento
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg">
                      <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Sessioni</p>
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        {funnelData.summary.totalSessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-green-500/20 rounded-lg">
                      <Target className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Conversioni</p>
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        {funnelData.summary.completedSessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Tasso</p>
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        {funnelData.summary.overallConversion.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Abbandoni</p>
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        {funnelData.summary.abandonedSessions}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Funnel Visualization */}
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-white">
                  Funnel di Conversione
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 sm:space-y-4">
                  {funnelData.funnel.map((step: FunnelStep, index: number) => {
                    const width = step.conversionRate;
                    const isLast = index === funnelData.funnel.length - 1;

                    return (
                      <div key={step.step}>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm font-medium text-white">
                              {getStepLabel(step.step)}
                            </span>
                            <span className="text-xs sm:text-sm text-gray-400">
                              {step.sessions} sessioni
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4">
                            <span className="text-xs sm:text-sm font-semibold text-green-400">
                              {step.conversionRate.toFixed(1)}%
                            </span>
                            {step.dropOffRate > 0 && (
                              <span className="text-xs sm:text-sm text-red-400">
                                -{step.dropOffRate.toFixed(1)}% drop-off
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-white/5 rounded-full h-6 sm:h-8">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-6 sm:h-8 rounded-full flex items-center justify-center transition-all"
                              style={{ width: `${width}%` }}
                            >
                              {width > 20 && (
                                <span className="text-xs font-medium text-white">
                                  {step.sessions}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!isLast && (
                          <div className="flex justify-center my-1 sm:my-2">
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sources & Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Sources */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-white">
                    Performance per Sorgente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!funnelData?.sources || funnelData.sources.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 text-sm">
                      Nessuna sorgente tracciata
                    </p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {funnelData.sources.map((source: Source) => (
                        <div
                          key={source.source}
                          className="p-2 sm:p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className="text-sm sm:text-base font-medium text-white capitalize">
                              {source.source}
                            </span>
                            <span className="text-xs sm:text-sm text-green-400 font-semibold">
                              {source.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                            <span>{source.sessions} sessioni</span>
                            <span>•</span>
                            <span>{source.conversions} conversioni</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campaigns */}
              <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg text-white">
                    Performance per Campagna
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!funnelData?.campaigns || funnelData.campaigns.length === 0 ? (
                    <p className="text-gray-400 text-center py-4 text-sm">
                      Nessuna campagna tracciata
                    </p>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {funnelData.campaigns.map((campaign: Campaign) => (
                        <div
                          key={campaign.campaign}
                          className="p-2 sm:p-3 rounded-lg bg-white/5 border border-white/5"
                        >
                          <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <span className="text-sm sm:text-base font-medium text-white">
                              {campaign.campaign}
                            </span>
                            <span className="text-xs sm:text-sm text-green-400 font-semibold">
                              {campaign.conversionRate.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                            <span>{campaign.sessions} sessioni</span>
                            <span>•</span>
                            <span>{campaign.conversions} conversioni</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Abandoned Carts */}
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  Carrelli Abbandonati
                </CardTitle>
              </CardHeader>
              <CardContent>
                {funnelData.abandonedCarts.length === 0 ? (
                  <p className="text-gray-400 text-center py-4 text-sm">
                    Nessun carrello abbandonato
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full min-w-[500px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-300">
                            Contatto
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-300">
                            Sorgente
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-300">
                            Ultimo Step
                          </th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-300">
                            Inattività
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {funnelData.abandonedCarts.slice(0, 20).map((cart: AbandonedCart) => (
                          <tr
                            key={cart.sessionId}
                            className="border-b border-white/5 hover:bg-white/5"
                          >
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <div className="space-y-1">
                                {cart.email && (
                                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
                                    <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{cart.email}</span>
                                  </div>
                                )}
                                {cart.phone && (
                                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-300">
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span>{cart.phone}</span>
                                  </div>
                                )}
                                {!cart.email && !cart.phone && (
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    Anonimo
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span className="text-xs sm:text-sm text-gray-300 capitalize">
                                {cart.source || 'direct'}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span className="text-xs sm:text-sm text-gray-300">
                                {getStepLabel(cart.lastStep)}
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <span className="text-xs sm:text-sm text-amber-400">
                                {formatTimeSince(cart.timeSinceLastActivity)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
