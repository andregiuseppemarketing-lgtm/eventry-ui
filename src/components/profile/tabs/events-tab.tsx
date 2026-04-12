'use client';

import { useState } from 'react';
import { EventCardFuture } from './event-card-future';
import { EventCardPast } from './event-card-past';
import { EventEmptyState } from './event-empty-state';
import { EventsTabSkeleton } from './events-tab-skeleton';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string | null;
  coverUrl?: string | null;
  dateStart: string;
  dateEnd?: string | null;
  status: string;
  ticketType?: string | null;
  venue?: {
    name: string;
    city?: string | null;
  } | null;
  _count?: {
    tickets?: number;
  };
}

interface EventsTabProps {
  futureEvents: Event[];
  pastEvents: Event[];
  isLoading?: boolean;
  isOwner?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * Tab Eventi con separazione futuri/passati
 * Sprint 1: Pagination semplice, no infinite scroll
 */
export function EventsTab({
  futureEvents,
  pastEvents,
  isLoading = false,
  isOwner = false,
  hasMore = false,
  onLoadMore,
}: EventsTabProps) {
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    if (!onLoadMore) return;
    setLoadingMore(true);
    await onLoadMore();
    setLoadingMore(false);
  };

  if (isLoading) {
    return <EventsTabSkeleton />;
  }

  const hasEvents = futureEvents.length > 0 || pastEvents.length > 0;

  if (!hasEvents) {
    return <EventEmptyState isOwner={isOwner} />;
  }

  return (
    <div className="py-6 space-y-6">
      {/* Eventi Futuri */}
      {futureEvents.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-lg font-semibold px-4">Prossimi Eventi</h3>
          <div className="space-y-4 px-4">
            {futureEvents.map((event) => (
              <EventCardFuture key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Divisore se ci sono entrambe le sezioni */}
      {futureEvents.length > 0 && pastEvents.length > 0 && (
        <div className="flex items-center gap-3 px-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-sm text-muted-foreground">Eventi Passati</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* Eventi Passati */}
      {pastEvents.length > 0 && (
        <section className="space-y-4">
          {futureEvents.length === 0 && (
            <h3 className="text-lg font-semibold px-4">Eventi Partecipati</h3>
          )}
          <div className="space-y-4 px-4">
            {pastEvents.map((event) => (
              <EventCardPast key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center px-4 pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="min-w-[200px]"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              'Mostra altri eventi'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
