'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { Calendar, MapPin, MoreVertical } from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { it } from 'date-fns/locale';
import { UserRole } from '@/types/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EventQuickActions } from './event-quick-actions';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  dateStart: string;
  dateEnd?: string | null;
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  ticketType?: string | null;
  venue?: {
    name: string;
    city?: string | null;
  } | null;
}

// Helper: CTA dinamica basata su ticketType e stato evento
function getEventCTA(event: Event, isPast: boolean): string {
  if (isPast) return 'Vedi Report';
  
  switch (event.ticketType) {
    case 'FREE_LIST':
      return 'Entra in Lista';
    case 'DOOR_ONLY':
      return 'Paga alla Cassa';
    case 'PRE_SALE':
      return 'Prenota Ora';
    case 'FULL_TICKET':
      return 'Acquista Biglietto';
    default:
      return 'Vedi Dettagli';
  }
}

interface EventCardProps {
  event: Event;
  userRole: UserRole;
}

/**
 * Card evento per lista eventi
 * Click verso /eventi/[id], quick actions in dropdown
 */
export function EventCard({ event, userRole }: EventCardProps) {
  const dateStart = parseISO(event.dateStart);
  const isEventPast = isPast(dateStart);

  const getStatusBadge = () => {
    if (isEventPast && event.status === 'PUBLISHED') {
      return <Badge variant="secondary">Passato</Badge>;
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <Link href={`/eventi/${event.id}` as Route}>
        <div className="relative h-48 w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
              {event.title.charAt(0)}
            </div>
          )}
          <div className="absolute top-2 right-2">{getStatusBadge()}</div>
        </div>
      </Link>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/eventi/${event.id}` as Route}
            className="flex-1 hover:underline"
          >
            <h3 className="font-semibold text-lg line-clamp-2">
              {event.title}
            </h3>
          </Link>

          {/* Quick Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <EventQuickActions
                eventId={event.id}
                userRole={userRole}
                layout="dropdown"
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {event.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Data */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>
            {format(dateStart, 'EEE d MMM yyyy, HH:mm', { locale: it })}
          </span>
        </div>

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>
              {event.venue.name}
              {event.venue.city && ` - ${event.venue.city}`}
            </span>
          </div>
        )}

        {/* Action Button */}
        <Button asChild className="w-full mt-4" variant="outline">
          <Link href={`/eventi/${event.id}` as Route}>
            {getEventCTA(event, isEventPast)}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
