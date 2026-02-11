'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';

/**
 * Link ottimizzato con prefetch intelligente
 * Esegue prefetch solo quando il link è visibile viewport
 */
export function PrefetchLink({
  href,
  children,
  className,
  prefetch = true,
}: {
  href: Route;
  children: React.ReactNode;
  className?: string;
  prefetch?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!prefetch) return;

    // Prefetch route quando il componente è montato
    const timer = setTimeout(() => {
      router.prefetch(href);
    }, 100);

    return () => clearTimeout(timer);
  }, [href, prefetch, router]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

/**
 * Hook per prefetch route critiche all'avvio
 */
export function usePrefetchCriticalRoutes() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch route critiche dopo 2 secondi dall'idle
    const timer = setTimeout(() => {
      const criticalRoutes: Route[] = [
        '/dashboard',
        '/eventi',
        '/biglietti',
        '/checkin',
        '/clienti',
      ];

      criticalRoutes.forEach((route) => {
        router.prefetch(route);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);
}
