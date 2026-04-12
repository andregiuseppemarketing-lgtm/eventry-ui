'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Calendar, MapPin, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  coverUrl?: string | null;
  dateStart: string;
  ticketType?: string | null;
  venue?: {
    name: string;
    city?: string | null;
  } | null;
  _count?: {
    tickets?: number;
  };
}

/**
 * Event Card Futuro
 * Sprint 1: NO secondary action (bookmark/like), solo CTA principale
 * CTA dinamica basata su ticketType (riuso logica M14)
 */
export function EventCardFuture({ event }: { event: Event }) {
  const dateStart = parseISO(event.dateStart);
  
  // CTA dinamica per ticketType
  const getEventCTA = () => {
    switch (event.ticketType) {
      case 'FREE_LIST':
        return 'Entra in Lista';
      case 'DOOR_ONLY':
        return 'Info alla Cassa';
      case 'PRE_SALE':
        return 'Prenota Ora';
      case 'FULL_TICKET':
        return 'Acquista Biglietto';
      default:
        return 'Vedi Dettagli';
    }
  };

  // Badge ticketType
  const getTicketBadge = () => {
    if (!event.ticketType) return null;
    
    const labels: Record<string, string> = {
      FREE_LIST: 'Lista Gratuita',
      DOOR_ONLY: 'Ingresso Cassa',
      PRE_SALE: 'Prevendita',
      FULL_TICKET: 'Biglietto',
    };

    return labels[event.ticketType] || event.ticketType;
  };

  const registrationCount = event._count?.tickets || 0;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/eventi/${event.id}` as Route}>
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-4xl font-bold">
              {event.title.charAt(0)}
            </div>
          )}

          {/* Ticket Badge */}
          {getTicketBadge() && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                🎫 {getTicketBadge()}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date Block */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-lg">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-semibold text-sm">
            {format(dateStart, "EEE d MMM · HH:mm", { locale: it }).toUpperCase()}
          </span>
        </div>

        {/* Title */}
        <Link href={`/eventi/${event.id}` as Route}>
          <h4 className="font-bold text-lg line-clamp-2 hover:text-primary transition-colors">
            {event.title}
          </h4>
        </Link>

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>
              {event.venue.name}
              {event.venue.city && ` · ${event.venue.city}`}
            </span>
          </div>
        )}

        {/* Registrations Count */}
        {registrationCount > 10 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>+{registrationCount} registrati</span>
          </div>
        )}

        {/* CTA */}
        <Button asChild className="w-full" size="lg">
          <Link href={`/eventi/${event.id}` as Route}>
            {getEventCTA()}
          </Link>
        </Button>
      </div>
    </Card>
  );
}
