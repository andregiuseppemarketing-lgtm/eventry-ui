'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PhoneModal } from '@/components/phone-modal';
import { UserNav } from '@/components/user-nav';
import { MobileNav } from '@/components/mobile-nav';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CalendarDays,
  Users, 
  Ticket, 
  TrendingUp,
  Plus,
  BarChart3,
  QrCode,
  UserCheck,
  LineChart,
  Euro,
  Target,
  MoreVertical,
  Eye,
  EyeOff,
  Ban,
  Trash2,
  Check,
  Search,
  MapPin,
  SlidersHorizontal,
  X,
  Building2,
  Music2,
  LogOut,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

type Event = {
  id: string;
  title: string;
  dateStart: string;
  status: string;
  venue: {
    name: string;
    city: string;
  };
  _count: {
    tickets: number;
    lists: number;
  };
};

type Stats = {
  totalEvents: number;
  totalTickets: number;
  totalCheckins: number;
  upcomingEvents: number;
};

type TabKey = 'ongoing' | 'past' | 'draft' | 'cancelled';
type PeriodKey = 'month' | 'year';

async function fetchDashboardData(role: string, period: PeriodKey) {
  const [eventsRes, statsRes] = await Promise.all([
    fetch('/api/events'),
    fetch(`/api/stats/dashboard?period=${period}`),
  ]);

  if (!eventsRes.ok || !statsRes.ok) {
    throw new Error('Failed to fetch dashboard data');
  }

  const eventsData = await eventsRes.json();
  const statsData = await statsRes.json();

  return {
    events: eventsData.data?.events || [],
    stats: statsData.data || {
      totalEvents: 0,
      totalTickets: 0,
      totalCheckins: 0,
      upcomingEvents: 0,
    },
  };
}

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  onClick 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  trend?: string;
  onClick?: () => void;
}) {
  const CardWrapper = onClick ? 'button' : 'div';
  
  return (
    <CardWrapper
      onClick={onClick}
      className={`group relative overflow-hidden glass border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_40px_hsl(var(--primary)/0.3)] ${
        onClick ? 'cursor-pointer w-full text-left' : ''
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-semibold tracking-tight gradient-text">{value.toLocaleString()}</h3>
          {trend && (
            <p className="text-xs text-muted-foreground/70">{trend}</p>
          )}
        </div>
        <div className="rounded-full bg-primary/10 p-3 text-primary group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardWrapper>
  );
}

function EventsList({ events, setActiveTab }: { events: Event[]; setActiveTab: (tab: TabKey) => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);

  const handleEventAction = async (eventId: string, action: string, eventTitle: string) => {
    const confirmMessages: Record<string, string> = {
      publish: `Sei sicuro di voler pubblicare "${eventTitle}"?`,
      draft: `Sei sicuro di voler nascondere "${eventTitle}"? L'evento sarà spostato nelle Bozze e non sarà più visibile pubblicamente.`,
      cancel: `Sei sicuro di voler annullare "${eventTitle}"? L'evento sarà spostato negli Annullati.`,
      delete: `Sei sicuro di voler eliminare definitivamente "${eventTitle}"? Questa azione non può essere annullata.`,
    };

    if (!confirm(confirmMessages[action])) {
      return;
    }

    setLoadingEventId(eventId);

    try {
      const endpoint = `/api/events/${eventId}/status`;
      const options: RequestInit = action === 'delete' 
        ? { method: 'DELETE' }
        : {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action }),
          };

      const response = await fetch(endpoint, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Errore durante l\'operazione');
      }

      // Messaggi personalizzati in base all'azione
      const successMessages: Record<string, string> = {
        publish: `Evento pubblicato! Ora è visibile pubblicamente.`,
        draft: `Evento nascosto! Puoi trovarlo nella tab "Bozze".`,
        cancel: `Evento annullato! Puoi trovarlo nella tab "Annullati".`,
        delete: `Evento eliminato definitivamente.`,
      };

      toast({
        title: 'Successo',
        description: successMessages[action] || data.message,
      });

      // Cambia tab se l'evento è stato spostato
      if (action === 'draft') {
        setActiveTab('draft');
      } else if (action === 'cancel') {
        setActiveTab('cancelled');
      } else if (action === 'publish') {
        setActiveTab('ongoing');
      }

      // Ricarica i dati
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
    } catch (error) {
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Si è verificato un errore',
        variant: 'destructive',
      });
    } finally {
      setLoadingEventId(null);
    }
  };

  if (events.length === 0) {
    return (
      <Card className="glass border border-border p-8">
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl font-semibold">Nessun Evento</CardTitle>
          <CardDescription className="text-muted-foreground">
            Non hai ancora creato eventi. Inizia ora!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            asChild
            className="btn-primary"
          >
            <Link href="/eventi/nuovo">
              <Plus className="mr-2 h-4 w-4" />
              Crea Primo Evento
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Card
          key={event.id}
          className="group glass border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
        >
          <CardHeader className="flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-semibold tracking-tight">{event.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {event.venue.name}, {event.venue.city}
                </CardDescription>
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                  event.status === 'PUBLISHED'
                    ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                    : event.status === 'DRAFT'
                    ? 'border-amber-400/30 bg-amber-400/10 text-amber-300'
                    : event.status === 'CANCELLED'
                    ? 'border-red-400/30 bg-red-400/10 text-red-300'
                    : 'border-slate-400/30 bg-slate-400/10 text-slate-300'
                }`}
              >
                {event.status}
              </div>
              
              {/* Menu Azioni */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={loadingEventId === event.id}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {event.status === 'DRAFT' && (
                    <DropdownMenuItem
                      onClick={() => handleEventAction(event.id, 'publish', event.title)}
                      className="cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Pubblica
                    </DropdownMenuItem>
                  )}
                  
                  {event.status === 'PUBLISHED' && (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleEventAction(event.id, 'draft', event.title)}
                        className="cursor-pointer"
                      >
                        <EyeOff className="mr-2 h-4 w-4" />
                        Nascondi (Bozza)
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleEventAction(event.id, 'cancel', event.title)}
                        className="cursor-pointer text-red-400 focus:text-red-400"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Annulla Evento
                      </DropdownMenuItem>
                    </>
                  )}

                  {event.status === 'CANCELLED' && (
                    <DropdownMenuItem
                      onClick={() => handleEventAction(event.id, 'publish', event.title)}
                      className="cursor-pointer"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Ripubblica
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem
                    onClick={() => handleEventAction(event.id, 'delete', event.title)}
                    className="cursor-pointer text-red-400 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Elimina
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {new Date(event.dateStart).toLocaleDateString('it-IT', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                {event._count.lists} liste
              </div>
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-primary" />
                {event._count.tickets} biglietti
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                asChild
                size="sm"
                className="btn-ghost"
              >
                <Link href={`/analytics/${event.id}` as Route}>
                  <LineChart className="mr-1 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="btn-ghost"
              >
                <Link href={`/eventi/${event.id}/consumazioni` as Route}>
                  <Euro className="mr-1 h-4 w-4" />
                  Consumazioni
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="btn-ghost"
              >
                <Link href="/marketing/funnel">
                  <Target className="mr-1 h-4 w-4" />
                  Funnel
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="btn-ghost"
              >
                <Link href={`/stats/event/${event.id}` as Route}>
                  <BarChart3 className="mr-1 h-4 w-4" />
                  Stats
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="btn-primary"
              >
                <Link href={`/eventi/${event.id}` as Route}>
                  Gestisci
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('ongoing');
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('month');
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
    
    // Mostra modal telefono se manca
    if (status === 'authenticated' && session?.user && !session.user.phone) {
      setShowPhoneModal(true);
    }
  }, [status, router, session]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', session?.user?.role, activePeriod],
    queryFn: () => fetchDashboardData(session?.user?.role || 'USER', activePeriod),
    enabled: !!session?.user,
  });

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="w-full max-w-5xl space-y-8 animate-pulse">
          <div className="h-10 w-48 rounded-full bg-primary/20" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-2xl glass"
              />
            ))}
          </div>
          <div className="h-72 rounded-2xl glass" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <Card className="max-w-lg border border-destructive/40 bg-destructive/10 p-8 backdrop-blur-xl">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl font-semibold">Errore</CardTitle>
            <CardDescription className="text-foreground/70">
              Impossibile caricare i dati della dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const events = data?.events ?? [];
  const stats = data?.stats ?? {
    totalEvents: 0,
    totalTickets: 0,
    totalCheckins: 0,
    upcomingEvents: 0,
  };
  const userRole = session?.user?.role;

  const now = new Date();
  
  // Filtri e ricerca
  const filterEvents = (eventsList: Event[]) => {
    let filtered = eventsList;
    
    // Filtro per ricerca titolo
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro per città
    if (selectedCity !== 'all') {
      filtered = filtered.filter(event => event.venue.city === selectedCity);
    }
    
    // Ordinamento per data
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.dateStart).getTime();
      const dateB = new Date(b.dateStart).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    return filtered;
  };
  
  // Estrai città uniche dagli eventi
  const cities: string[] = Array.from(new Set(events.map((e: Event) => e.venue.city as string))).sort() as string[];
  
  const ongoingEvents = filterEvents(
    events.filter(
      (event: Event) => event.status === 'PUBLISHED' && new Date(event.dateStart) > now
    )
  );
  const pastEvents = filterEvents(
    events.filter(
      (event: Event) => new Date(event.dateStart) < now && event.status !== 'CANCELLED' && event.status !== 'DRAFT'
    )
  );
  const draftEvents = filterEvents(
    events.filter((event: Event) => event.status === 'DRAFT')
  );
  const cancelledEvents = filterEvents(
    events.filter((event: Event) => event.status === 'CANCELLED')
  );

  const getTriggerClasses = (value: TabKey) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';
    return `${baseClasses} ${
      activeTab === value
        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
    }`;
  };

  const getPeriodClasses = (value: PeriodKey) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50';
    return `${baseClasses} ${
      activePeriod === value
        ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
    }`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6 pb-24 md:px-6 md:py-16 md:pb-16">
          <div className="flex flex-col gap-8 md:gap-12">
            
            {/* Header con Avatar - Mobile First */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-xs md:text-sm text-muted-foreground">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Panorama eventi
                </div>
                <h1 className="text-2xl font-semibold tracking-tight md:text-5xl gradient-text">
                  🔥 Benvenuto, {session?.user?.name?.split(' ')[0] || 'Admin'} 🔥
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                  Monitora performance, gestisci eventi e accedi rapidamente agli strumenti di organizzazione.
                </p>
              </div>
              
              {/* Avatar desktop */}
              <div className="hidden md:block">
                <UserNav />
              </div>
            </div>

            {/* Azioni Principali - Organizzate per logica */}
            <div className="space-y-4">
              {/* Azioni Primarie - Solo se ORGANIZER/ADMIN */}
              {['ORGANIZER', 'ADMIN'].includes(session?.user?.role || '') && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    asChild
                    size="lg"
                    className="btn-primary h-auto py-4"
                  >
                    <Link href="/eventi/nuovo" className="flex items-center justify-center gap-2">
                      <Plus className="h-5 w-5" />
                      <span className="font-semibold">Nuovo Evento</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="glass h-auto py-4 border-primary/40"
                  >
                    <Link href="/checkin" className="flex items-center justify-center gap-2">
                      <QrCode className="h-5 w-5" />
                      <span className="font-semibold">Verifica Ingressi</span>
                    </Link>
                  </Button>
                </div>
              )}

              {/* Azioni Secondarie - Grid responsive */}
              {['ORGANIZER', 'ADMIN'].includes(session?.user?.role || '') && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    asChild
                    variant="outline"
                    className="glass border-blue-500/40 justify-start"
                  >
                    <Link href="/analytics/general">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Dashboard Generale Aggregata
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="glass border-purple-500/40 justify-start"
                  >
                    <Link href="/clubs">
                      <Building2 className="mr-2 h-4 w-4" />
                      I Miei Club
                    </Link>
                  </Button>
                </div>
              )}

              {/* Marketing Automation - Solo ADMIN */}
              {session?.user?.role === 'ADMIN' && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full glass border-green-500/40 bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 justify-start"
                >
                  <Link href="/dashboard/marketing">
                    <Mail className="mr-2 h-4 w-4" />
                    Marketing Automation
                  </Link>
                </Button>
              )}

              {/* Dashboard DJ */}
              {session?.user?.role === 'DJ' && (
                <Button
                  asChild
                  size="lg"
                  className="w-full btn-primary bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-auto py-4"
                >
                  <Link href="/dj/dashboard" className="flex items-center justify-center gap-2">
                    <Music2 className="h-5 w-5" />
                    <span className="font-semibold">DJ Dashboard</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Statistiche periodo */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl gradient-text">
                  {activePeriod === 'month' 
                    ? `Statistiche ${new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`
                    : `Statistiche anno ${new Date().getFullYear()}`
                  }
                </h2>
                
                {/* Filtro Periodo - Mese/Anno */}
                <div className="inline-flex w-full sm:w-auto rounded-full border border-border glass p-1">
                  <button
                    type="button"
                    onClick={() => setActivePeriod('month')}
                    className={getPeriodClasses('month')}
                  >
                    Mese
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePeriod('year')}
                    className={getPeriodClasses('year')}
                  >
                    Anno
                  </button>
                </div>
              </div>
            </div>

            {/* Cards statistiche */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard 
                title="Eventi Totali" 
                value={stats.totalEvents} 
                icon={CalendarDays}
                onClick={() => router.push('/eventi' as Route)}
              />
              <StatsCard 
                title="QR Emessi" 
                value={stats.totalTickets} 
                icon={QrCode}
                onClick={() => router.push('/biglietti' as Route)}
              />
              <StatsCard 
                title="Ingressi Totali" 
                value={stats.totalCheckins} 
                icon={UserCheck}
              />
              <StatsCard 
                title="Eventi in Corso" 
                value={stats.upcomingEvents} 
                icon={BarChart3}
                onClick={() => setActiveTab('ongoing')}
              />
            </div>

            {/* Sezione Eventi */}
            <div className="space-y-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-3xl font-semibold tracking-tight gradient-text">
                  Eventi
                </h2>
                
                {/* Toggle filtri */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="glass self-start md:self-auto"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  {showFilters ? 'Nascondi' : 'Mostra'} Filtri
                </Button>
              </div>

              {/* Pannello Filtri */}
              {showFilters && (
                <Card className="glass border border-border p-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Ricerca */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Search className="h-4 w-4" />
                        Cerca evento
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Titolo o locale..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Filtro Città */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Città
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      >
                        <option value="all">Tutte le città</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Ordinamento */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Ordina per data
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                        className="w-full rounded-lg border border-border bg-background/50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
                      >
                        <option value="asc">Dal più vecchio</option>
                        <option value="desc">Dal più recente</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Reset filtri */}
                  {(searchTerm || selectedCity !== 'all' || sortOrder !== 'asc') && (
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCity('all');
                          setSortOrder('asc');
                        }}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reset filtri
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* Tab Eventi - Eventi in Corso/Passati/Bozze/Annullati */}
              <div className="inline-flex rounded-full border border-border glass p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('ongoing')}
                  className={getTriggerClasses('ongoing')}
                >
                  In Corso
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('past')}
                  className={getTriggerClasses('past')}
                >
                  Passati
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('draft')}
                  className={getTriggerClasses('draft')}
                >
                  Bozze
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('cancelled')}
                  className={getTriggerClasses('cancelled')}
                >
                  Annullati
                </button>
              </div>

              {activeTab === 'ongoing' && <EventsList events={ongoingEvents} setActiveTab={setActiveTab} />}
              {activeTab === 'past' && <EventsList events={pastEvents} setActiveTab={setActiveTab} />}
              {activeTab === 'draft' && <EventsList events={draftEvents} setActiveTab={setActiveTab} />}
              {activeTab === 'cancelled' && <EventsList events={cancelledEvents} setActiveTab={setActiveTab} />}
            </div>
          </div>
        </div>
      </div>

      {/* Modal telefono */}
      <PhoneModal 
        isOpen={showPhoneModal} 
        onClose={() => setShowPhoneModal(false)} 
      />

      {/* Mobile Navigation - Bottom Bar */}
      <MobileNav />
    </div>
  );
}
