'use client';

import { use, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { EventQuickActions } from '@/components/events/event-quick-actions';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Euro,
  Users as UsersIcon,
  Share2,
  Clock,
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { it } from 'date-fns/locale';
import { UserRole } from '@/types/navigation';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  dateStart: string;
  dateEnd?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  ticketType?: string | null;
  ticketPrice?: number | null;
  minAge?: number | null;
  dressCode?: string | null;
  venue?: {
    name: string;
    city?: string | null;
    address?: string | null;
  } | null;
}

async function fetchEvent(id: string) {
  const res = await fetch(`/api/events/${id}`);
  if (!res.ok) throw new Error('Evento non trovato');
  const data = await res.json();
  return data.event || data;
}

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * /eventi/[id] - Hub dettaglio evento
 * Overview evento con quick actions role-based
 */
export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const unwrappedParams = use(params);

  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ['event', unwrappedParams.id],
    queryFn: () => fetchEvent(unwrappedParams.id),
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
        <div className="animate-pulse text-primary">Caricamento evento...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">
            Evento non trovato
          </h2>
          <Button asChild className="mt-4">
            <Link href={'/eventi' as Route}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna agli eventi
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const userRole = (session?.user?.role || 'USER') as UserRole;
  const dateStart = parseISO(event.dateStart);
  const isEventPast = isPast(dateStart);

  const getStatusBadge = () => {
    if (isEventPast && event.status === 'PUBLISHED') {
      return <Badge variant="secondary">Evento Passato</Badge>;
    }

    switch (event.status) {
      case 'DRAFT':
        return <Badge variant="outline">Bozza</Badge>;
      case 'PUBLISHED':
        return <Badge variant="default">Pubblicato</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Annullato</Badge>;
      default:
        return null;
    }
  };

  const customLabels = {
    '/eventi': 'Eventi',
    [`/eventi/${unwrappedParams.id}`]: event.title,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px] w-full">
        {/* Cover Image */}
        <div className="absolute inset-0">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="bg-black/50 backdrop-blur-md hover:bg-black/70 text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/50 backdrop-blur-md hover:bg-black/70 text-white"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <div className="container mx-auto">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  {event.title}
                </h1>
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs customLabels={customLabels} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Info Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {/* Data */}
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">
                      {format(dateStart, "EEEE d MMMM yyyy 'alle' HH:mm", {
                        locale: it,
                      })}
                    </p>
                    {event.dateEnd && (
                      <p className="text-sm text-muted-foreground">
                        Fino al{' '}
                        {format(parseISO(event.dateEnd), 'd MMM yyyy, HH:mm', {
                          locale: it,
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Venue */}
                {event.venue && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{event.venue.name}</p>
                      {event.venue.city && (
                        <p className="text-sm text-muted-foreground">
                          {event.venue.address && `${event.venue.address}, `}
                          {event.venue.city}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Prezzo */}
                {event.ticketPrice !== null && event.ticketPrice !== undefined && (
                  <div className="flex items-center gap-3">
                    <Euro className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {event.ticketPrice === 0
                          ? 'Ingresso gratuito'
                          : `€${event.ticketPrice.toFixed(2)}`}
                      </p>
                      {event.ticketType && (
                        <p className="text-sm text-muted-foreground">
                          {event.ticketType}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Età minima */}
                {event.minAge && (
                  <div className="flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-muted-foreground" />
                    <p className="font-medium">Età minima: {event.minAge}+</p>
                  </div>
                )}

                {/* Dress Code */}
                {event.dressCode && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Dress Code</p>
                      <p className="text-sm text-muted-foreground">
                        {event.dressCode}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {event.description && (
              <Card>
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">
                    Descrizione Evento
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Azioni Rapide</h2>
                <EventQuickActions
                  eventId={unwrappedParams.id}
                  userRole={userRole}
                  layout="grid"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
