'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

/**
 * Skeleton loader per tab Eventi
 * Replica la struttura delle event card
 */
export function EventsTabSkeleton() {
  return (
    <div className="py-6 space-y-6">
      {/* Header skeleton */}
      <div className="px-4">
        <Skeleton className="h-6 w-32" />
      </div>

      {/* Event cards skeleton */}
      <div className="space-y-4 px-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            {/* Cover skeleton */}
            <Skeleton className="h-48 w-full" />

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
              {/* Date block */}
              <Skeleton className="h-8 w-40" />

              {/* Title */}
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />

              {/* Venue */}
              <Skeleton className="h-4 w-56" />

              {/* CTA */}
              <Skeleton className="h-11 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
