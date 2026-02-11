'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClientSpendingHistory } from '@/components/client-spending-history';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  Instagram,
  Mail,
  Phone,
  Briefcase,
  Users,
  Ticket,
  Star,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

async function fetchGuestDetail(id: string) {
  const res = await fetch(`/api/guests/${id}`);
  if (!res.ok) throw new Error('Failed to fetch guest');
  return res.json();
}

export default function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const { data, isLoading, error } = useQuery({
    queryKey: ['guest', unwrappedParams.id],
    queryFn: () => fetchGuestDetail(unwrappedParams.id),
    enabled: !!session,
  });

  if (status === 'unauthenticated') {
    router.push('/auth/login' as Route);
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Caricamento...</div>
      </div>
    );
  }

  if (error || !data?.data?.guest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-lg border border-destructive/40 bg-destructive/10 p-8">
          <CardHeader>
            <CardTitle>Cliente non trovato</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="btn-primary">
              <Link href="/clienti">Torna alla lista</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { guest, stats } = data.data;

  const getSegmentColor = (segment: string) => {
    const colors = {
      NEW: 'text-blue-400',
      OCCASIONAL: 'text-cyan-400',
      REGULAR: 'text-emerald-400',
      VIP: 'text-amber-400',
      DORMANT: 'text-slate-400',
    };
    return colors[segment as keyof typeof colors] || 'text-foreground';
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradienti */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div>
              <Button
                asChild
                variant="ghost"
                className="btn-ghost mb-4"
              >
                <Link href="/clienti">
                  <ArrowLeft className="w-4 h-4" />
                  Torna ai clienti
                </Link>
              </Button>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-semibold tracking-tight gradient-text">
                    {guest.firstName} {guest.lastName}
                  </h1>
                  {guest.nickname && (
                    <p className="text-lg text-muted-foreground mt-2">
                      "{guest.nickname}"
                    </p>
                  )}
                </div>
                <span className={`text-sm font-medium uppercase tracking-wide ${getSegmentColor(guest.customerSegment)}`}>
                  {guest.customerSegment}
                </span>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="glass border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Eventi Totali</p>
                    <p className="text-2xl font-semibold gradient-text">{stats.totalEvents}</p>
                  </div>
                </div>
              </Card>

              <Card className="glass border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-emerald-500/10 p-3">
                    <Ticket className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Check-in</p>
                    <p className="text-2xl font-semibold text-emerald-400">{stats.totalCheckins}</p>
                  </div>
                </div>
              </Card>

              <Card className="glass border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-amber-500/10 p-3">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Gruppo Medio</p>
                    <p className="text-2xl font-semibold text-amber-400">{stats.avgGroupSize}</p>
                  </div>
                </div>
              </Card>

              <Card className="glass border border-border p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-cyan-500/10 p-3">
                    <Calendar className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ultimo Evento</p>
                    <p className="text-sm font-medium text-cyan-400">
                      {stats.lastEventDate 
                        ? new Date(stats.lastEventDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
                        : 'Mai'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Dettagli e Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informazioni Personali */}
              <Card className="glass border border-border">
                <CardHeader>
                  <CardTitle className="text-xl">Informazioni Personali</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {guest.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm">{guest.email}</p>
                      </div>
                    </div>
                  )}
                  {guest.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Telefono</p>
                        <p className="text-sm">{guest.phone}</p>
                      </div>
                    </div>
                  )}
                  {guest.instagram && (
                    <div className="flex items-center gap-3">
                      <Instagram className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Instagram</p>
                        <a 
                          href={`https://instagram.com/${guest.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          @{guest.instagram}
                        </a>
                      </div>
                    </div>
                  )}
                  {guest.city && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Città</p>
                        <p className="text-sm">{guest.city}</p>
                      </div>
                    </div>
                  )}
                  {guest.birthDate && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Data di Nascita</p>
                        <p className="text-sm">
                          {new Date(guest.birthDate).toLocaleDateString('it-IT')}
                        </p>
                      </div>
                    </div>
                  )}
                  {guest.occupation && (
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Occupazione</p>
                        <p className="text-sm">{guest.occupation}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timeline Eventi */}
              <Card className="glass border border-border lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Storico Eventi</CardTitle>
                </CardHeader>
                <CardContent>
                  {guest.listEntries && guest.listEntries.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {guest.listEntries.map((entry: any) => (
                        <div key={entry.id} className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card/50">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">
                              {entry.list.event.title}
                            </h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(entry.list.event.dateStart).toLocaleDateString('it-IT')}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {entry.list.event.venue.name}, {entry.list.event.venue.city}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {entry.list.type}
                              </span>
                            </div>
                            {entry.tickets.length > 0 && entry.tickets[0].checkins.length > 0 && (
                              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                                <Ticket className="w-3 h-3" />
                                Check-in effettuato
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nessun evento registrato</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Storico Spesa */}
            <ClientSpendingHistory guestId={unwrappedParams.id} />

            {/* Feedback e Segnalazioni */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback */}
              <Card className="glass border border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400" />
                    Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {guest.feedbacks && guest.feedbacks.length > 0 ? (
                    <div className="space-y-4">
                      {guest.feedbacks.map((feedback: any) => (
                        <div key={feedback.id} className="p-4 rounded-lg border border-border bg-card/50">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{feedback.event.title}</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < feedback.overallRating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {feedback.comment && (
                            <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessun feedback</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Segnalazioni Sicurezza */}
              <Card className="glass border border-border">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Segnalazioni
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {guest.securityNotes && guest.securityNotes.length > 0 ? (
                    <div className="space-y-4">
                      {guest.securityNotes.map((note: any) => (
                        <div key={note.id} className="p-4 rounded-lg border border-destructive/40 bg-destructive/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium uppercase text-destructive">
                              {note.severity}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.createdAt).toLocaleDateString('it-IT')}
                            </span>
                          </div>
                          <p className="text-sm text-foreground">{note.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Segnalato da: {note.reportedBy.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nessuna segnalazione</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
