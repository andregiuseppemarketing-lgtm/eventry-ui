/**
 * Lazy-loaded components per ottimizzare bundle size e performance
 * Questi componenti vengono caricati solo quando necessari
 */

import dynamic from 'next/dynamic';

// QR Scanner - pesante, caricato solo quando serve
export const QRScanner = dynamic(
  () => import('@yudiel/react-qr-scanner').then(mod => ({ default: mod.Scanner })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    ),
    ssr: false,
  }
);

// React Query Devtools - solo development
export const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => ({
    default: mod.ReactQueryDevtools,
  })),
  {
    ssr: false,
  }
);

// Chart components - pesanti, lazy load
export const LazyChart = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), {
  loading: () => <div className="h-64 bg-muted animate-pulse rounded-lg" />,
  ssr: false,
});

export const LazyBarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  ssr: false,
});

export const LazyLineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  ssr: false,
});

export const LazyPieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), {
  ssr: false,
});
