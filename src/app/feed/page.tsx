'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, Users, CheckCircle2, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface FeedEvent {
  id: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  coverUrl: string | null;
  minAge: number | null;
  dressCode: string | null;
  createdBy: {
    id: string;
    name: string;
    image: string | null;
    slug: string | null;
    verified: boolean;
  };
  venue: {
    id: string;
    name: string;
    city: string | null;
    slug: string | null;
  } | null;
  createdAt: string;
}

interface FeedResponse {
  events: FeedEvent[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

export default function FeedPage() {
  const { status } = useSession();
  const router = useRouter();
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      loadFeed();
    }
  }, [status, router]);

  const loadFeed = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/feed');
      if (!response.ok) {
        throw new Error('Errore nel caricamento del feed');
      }
      const data = await response.json();
      setFeed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadFeed}>Riprova</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Il tuo Feed</h1>
        <p className="text-muted-foreground text-lg">
          Eventi dagli artisti, locali e organizzatori che segui
        </p>
      </div>

      {feed?.events.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <Users className="h-16 w-16 text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-semibold mb-2">
                Il tuo feed è vuoto
              </h2>
              <p className="text-muted-foreground mb-6">
                Inizia a seguire artisti e locali per vedere i loro eventi qui
              </p>
              <div className="flex gap-3 justify-center">
                <Button asChild>
                  <Link href="/clubs">Scopri Locali</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/eventi">Esplora Eventi</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feed?.events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Event Image */}
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

                <CardHeader>
                  {/* Creator Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar>
                      <AvatarImage
                        src={event.createdBy.image || undefined}
                        alt={event.createdBy.name}
                      />
                      <AvatarFallback>
                        {event.createdBy.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <Link
                          href={
                            event.createdBy.slug
                              ? `/u/${event.createdBy.slug}`
                              : '#'
                          }
                          className="font-semibold hover:underline"
                        >
                          {event.createdBy.name}
                        </Link>
                        {event.createdBy.verified && (
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>

                  {/* Event Title */}
                  <Link
                    href={`/eventi/${event.id}`}
                    className="hover:underline"
                  >
                    <h3 className="text-xl font-bold line-clamp-2">
                      {event.title}
                    </h3>
                  </Link>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Description */}
                  {event.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  {/* Event Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {event.venue.name}
                          {event.venue.city && ` - ${event.venue.city}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild className="flex-1">
                      <Link href={`/eventi/${event.id}`}>Partecipa</Link>
                    </Button>
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          {feed?.hasMore && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={() => {
                  // Implement pagination
                }}
              >
                Carica altri eventi
              </Button>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Mostrando {feed?.events.length} di {feed?.total} eventi
          </div>
        </>
      )}
    </div>
  );
}
