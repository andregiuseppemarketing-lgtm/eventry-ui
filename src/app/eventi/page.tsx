'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { EventCard } from '@/components/events/event-card';
import { Loader2, Plus } from 'lucide-react';
import Link from 'next/link';
import { UserRole } from '@/types/navigation';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  dateStart: string;
  dateEnd?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  venue?: {
    name: string;
    city?: string | null;
  } | null;
}

async function fetchEvents() {
  const res = await fetch('/api/events');
  if (!res.ok) throw new Error('Failed to fetch events');
  const data = await res.json();
  return data.events || data.data?.events || [];
}

/**
 * /eventi - Hub centrale eventi
 * Lista eventi con quick actions role-based
 */
export default function EventiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: events, isLoading, error } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: fetchEvents,
    enabled: status === 'authenticated',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Errore nel caricamento eventi
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Errore sconosciuto'}
          </p>
        </div>
      </div>
    );
  }

  const userRole = (session?.user?.role || 'USER') as UserRole;
  const canCreateEvent = ['ADMIN', 'ORGANIZER'].includes(userRole);

  // Filtro eventi per ruolo
  const filteredEvents = events || [];
  if (userRole === 'PR' || userRole === 'ORGANIZER') {
    // TODO: filtrare per eventi di competenza
    // Per ora mostriamo tutti
  }

  const customLabels = {
    '/eventi': 'Eventi',
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs customLabels={customLabels} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 mt-6">
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === 'ADMIN' ? 'Tutti gli Eventi' : 'I miei Eventi'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {filteredEvents.length > 0
              ? `${filteredEvents.length} eventi trovati`
              : 'Nessun evento disponibile'}
          </p>
        </div>

        {canCreateEvent && (
          <Button asChild>
            <Link href={'/eventi/nuovo' as Route}>
              <Plus className="w-4 h-4 mr-2" />
              Crea Evento
            </Link>
          </Button>
        )}
      </div>

      {/* Eventi Grid */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Non ci sono eventi da mostrare
          </p>
          {canCreateEvent && (
            <Button asChild className="mt-4">
              <Link href={'/eventi/nuovo' as Route}>
                <Plus className="w-4 h-4 mr-2" />
                Crea il tuo primo evento
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} userRole={userRole} />
          ))}
        </div>
      )}
    </div>
  );
}
