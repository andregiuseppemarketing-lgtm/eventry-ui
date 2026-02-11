import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ChatButton } from '@/components/chat-button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar } from 'lucide-react';
import Image from 'next/image';

interface VenuePageProps {
  params: Promise<{ slug: string }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;

  const venue = await prisma.venue.findUnique({
    where: { slug },
    include: {
      club: true,
      events: {
        where: {
          dateStart: { gte: new Date() },
          status: 'PUBLISHED',
        },
        take: 5,
        orderBy: { dateStart: 'asc' },
      },
    },
  });

  if (!venue) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold mb-2">{venue.name}</h1>
            {venue.club && (
              <p className="text-muted-foreground">Parte di {venue.club.name}</p>
            )}
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Indirizzo</span>
              </div>
              <p className="font-medium">{venue.address}</p>
              <p className="text-sm text-muted-foreground">{venue.city}</p>
            </div>

            {venue.capacity && (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Capienza</span>
                </div>
                <p className="font-medium">{venue.capacity} persone</p>
              </div>
            )}

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Eventi</span>
              </div>
              <p className="font-medium">{venue.events.length} prossimi</p>
            </div>
          </div>

          {/* Chat Button */}
          <ChatButton
            whatsappNumber={venue.whatsappNumber}
            telegramHandle={venue.telegramHandle}
            className="w-full md:w-auto"
          />
        </div>

        {/* Upcoming Events */}
        {venue.events.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Prossimi Eventi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {venue.events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {event.coverUrl && (
                    <div className="relative h-48 w-full bg-muted">
                      <Image
                        src={event.coverUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.dateStart).toLocaleDateString('it-IT', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    {event.minAge && (
                      <Badge variant="outline">{event.minAge}+</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
