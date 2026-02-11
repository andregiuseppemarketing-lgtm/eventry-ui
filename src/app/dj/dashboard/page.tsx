'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Calendar,
  Music2,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO, isFuture, isPast } from 'date-fns';
import { it } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

type Event = {
  id: string;
  title: string;
  description?: string;
  date: string;
  venueName?: string;
  ticketsSold?: number;
  capacity?: number;
  status: string;
};

async function fetchDJEvents() {
  const res = await fetch('/api/events');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.data.events;
}

export default function DJDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
    if (status === 'authenticated' && session?.user?.role !== 'DJ') {
      router.push('/dashboard' as Route);
    }
  }, [status, router, session]);

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ['dj-events'],
    queryFn: fetchDJEvents,
    enabled: !!session?.user && session?.user?.role === 'DJ',
  });

  // Filtra eventi futuri/passati
  const upcomingEvents = allEvents.filter((event: Event) => 
    isFuture(parseISO(event.date)) && event.status === 'PUBLISHED'
  );
  const pastEvents = allEvents.filter((event: Event) => 
    isPast(parseISO(event.date))
  );

  // Statistiche
  const totalPerformances = pastEvents.length;
  const upcomingPerformances = upcomingEvents.length;
  const totalAttendees = pastEvents.reduce((sum: number, event: Event) => 
    sum + (event.ticketsSold || 0), 0
  );

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const displayEvents = view === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Music2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">DJ Dashboard</h1>
              <p className="text-muted-foreground">
                Benvenuto, {session?.user?.name || 'DJ'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass border border-border">
            <CardHeader className="pb-3">
              <CardDescription>Performance Totali</CardDescription>
              <CardTitle className="text-3xl">{totalPerformances}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Eventi completati
              </div>
            </CardContent>
          </Card>

          <Card className="glass border border-border">
            <CardHeader className="pb-3">
              <CardDescription>Prossime Performance</CardDescription>
              <CardTitle className="text-3xl">{upcomingPerformances}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="mr-2 h-4 w-4" />
                Eventi in programma
              </div>
            </CardContent>
          </Card>

          <Card className="glass border border-border">
            <CardHeader className="pb-3">
              <CardDescription>Pubblico Totale</CardDescription>
              <CardTitle className="text-3xl">{totalAttendees}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                Persone raggiunte
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toggle View */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === 'upcoming' ? 'default' : 'outline'}
            onClick={() => setView('upcoming')}
          >
            <Clock className="mr-2 h-4 w-4" />
            Prossimi Eventi ({upcomingPerformances})
          </Button>
          <Button
            variant={view === 'past' ? 'default' : 'outline'}
            onClick={() => setView('past')}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Storico ({totalPerformances})
          </Button>
        </div>

        {/* Lista Eventi */}
        {displayEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Music2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {view === 'upcoming' ? 'Nessun Evento in Programma' : 'Nessuna Performance Passata'}
              </h3>
              <p className="text-muted-foreground">
                {view === 'upcoming' 
                  ? 'Non hai performance programmate al momento'
                  : 'Non hai ancora fatto nessuna performance'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayEvents.map((event: Event) => {
              const eventDate = parseISO(event.date);
              const isUpcoming = isFuture(eventDate);
              
              return (
                <Card key={event.id} className="glass border border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-xl">{event.title}</CardTitle>
                          {isUpcoming && (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
                              In Programma
                            </span>
                          )}
                        </div>
                        {event.description && (
                          <CardDescription className="mt-1">
                            {event.description}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(eventDate, "EEEE d MMMM yyyy", { locale: it })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {format(eventDate, "HH:mm", { locale: it })}
                        </span>
                      </div>

                      {event.venueName && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venueName}</span>
                        </div>
                      )}
                    </div>

                    {!isUpcoming && event.ticketsSold !== undefined && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <TrendingUp className="h-4 w-4" />
                            <span>Partecipanti:</span>
                          </div>
                          <span className="font-semibold">
                            {event.ticketsSold}
                            {event.capacity && ` / ${event.capacity}`}
                          </span>
                        </div>
                        {event.capacity && (
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                              style={{ width: `${(event.ticketsSold / event.capacity) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <Link href={`/analytics/${event.id}` as Route}>
                        <Button variant="outline" size="sm">
                          Vedi Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
