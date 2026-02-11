'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load devtools solo in development
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => ({
    default: mod.ReactQueryDevtools,
  })),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minuti
        gcTime: 1000 * 60 * 10, // 10 minuti (prima era cacheTime)
        refetchOnWindowFocus: false, // Non refetch su focus finestra
        refetchOnMount: false, // Non refetch su mount se data disponibile
        retry: (failureCount, error: any) => {
          if (error?.status === 404 || error?.status === 401) return false;
          return failureCount < 2; // Ridotto da 3 a 2 retry
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
    },
  }));

  return (
    <SessionProvider 
      refetchInterval={5 * 60} // Refetch session ogni 5 minuti
      refetchOnWindowFocus={false}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  );
}