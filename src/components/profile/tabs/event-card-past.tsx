'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import type { Route } from 'next';
import { MapPin, Users, Image as ImageIcon, Share2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  coverUrl?: string | null;
  dateStart: string;
  venue?: {
    name: string;
    city?: string | null;
  } | null;
  _count?: {
    tickets?: number;
  };
}

/**
 * Event Card Passato
 * Cover desaturata, badge "Partecipato", CTA diverse (Foto, Condividi)
 */
export function EventCardPast({ event }: { event: Event }) {
  const dateStart = parseISO(event.dateStart);
  const attendeesCount = event._count?.tickets || 0;

  return (
    <Card className="overflow-hidden">
      <Link href={`/eventi/${event.id}` as Route}>
        {/* Cover Image - Desaturata */}
        <div className="relative h-40 w-full bg-muted">
          {event.coverUrl ? (
            <Image
              src={event.coverUrl}
              alt={event.title}
              fill
              className="object-cover grayscale-[60%] opacity-80"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-3xl font-bold">
              {event.title.charAt(0)}
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Badge Partecipato */}
          <div className="absolute top-3 left-3">
            <Badge variant="default" className="bg-green-600">
              ✅ Partecipato
            </Badge>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date */}
        <p className="text-xs text-muted-foreground">
          {format(dateStart, "d MMMM yyyy", { locale: it })}
        </p>

        {/* Title */}
        <Link href={`/eventi/${event.id}` as Route}>
          <h4 className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors">
            {event.title}
          </h4>
        </Link>

        {/* Venue */}
        {event.venue && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />
            <span className="line-clamp-1">
              {event.venue.name}
              {event.venue.city && ` · ${event.venue.city}`}
            </span>
          </div>
        )}

        {/* Attendees */}
        {attendeesCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>+{attendeesCount} persone</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/eventi/${event.id}#gallery` as Route}>
              <ImageIcon className="w-4 h-4 mr-2" />
              Foto
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Condividi
          </Button>
        </div>
      </div>
    </Card>
  );
}
