/**
 * Sistema di monitoraggio performance client-side
 * Traccia metriche Core Web Vitals e performance custom
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Thresholds Core Web Vitals (Google standards)
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
  FID: { good: 100, poor: 300 },        // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
  TTFB: { good: 800, poor: 1800 },      // Time to First Byte
  INP: { good: 200, poor: 500 },        // Interaction to Next Paint
};

function getRating(value: number, metric: keyof typeof THRESHOLDS): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Invia metriche a endpoint di analytics
 */
async function sendToAnalytics(metric: PerformanceMetric) {
  // Solo in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Performance]', metric);
    return;
  }

  try {
    // Usa sendBeacon per non bloccare la navigazione
    const blob = new Blob([JSON.stringify(metric)], { type: 'application/json' });
    navigator.sendBeacon('/api/analytics/performance', blob);
  } catch (error) {
    console.error('[Performance] Failed to send metric:', error);
  }
}

/**
 * Monitora Core Web Vitals usando Web Vitals library
 */
export function reportWebVitals(metric: any) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating || 'good',
    timestamp: Date.now(),
  };

  sendToAnalytics(performanceMetric);

  // Alert se performance critiche
  if (performanceMetric.rating === 'poor') {
    console.warn(`[Performance] POOR ${metric.name}: ${metric.value}`, metric);
  }
}

/**
 * Monitora tempo di caricamento pagina
 */
export function trackPageLoad(pageName: string) {
  if (typeof window === 'undefined') return;

  const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigationTiming) return;

  const metrics = {
    dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
    tcp: navigationTiming.connectEnd - navigationTiming.connectStart,
    ttfb: navigationTiming.responseStart - navigationTiming.requestStart,
    download: navigationTiming.responseEnd - navigationTiming.responseStart,
    domProcessing: navigationTiming.domComplete - navigationTiming.domInteractive,
    total: navigationTiming.loadEventEnd - navigationTiming.fetchStart,
  };

  console.log(`[Performance] ${pageName} Load:`, metrics);

  // Alert se TTFB > 1s (critico per UX)
  if (metrics.ttfb > 1000) {
    console.warn(`[Performance] SLOW TTFB on ${pageName}: ${metrics.ttfb}ms`);
  }
}

/**
 * Monitora API calls
 */
export function trackAPICall(endpoint: string, duration: number) {
  const metric: PerformanceMetric = {
    name: `api:${endpoint}`,
    value: duration,
    rating: duration < 500 ? 'good' : duration < 1000 ? 'needs-improvement' : 'poor',
    timestamp: Date.now(),
  };

  if (metric.rating === 'poor') {
    console.warn(`[Performance] SLOW API ${endpoint}: ${duration}ms`);
  }

  sendToAnalytics(metric);
}

/**
 * Monitora bundle size e memoria
 */
export function trackResourceMetrics() {
  if (typeof window === 'undefined' || !window.performance) return;

  // Calcola dimensione totale risorse caricate
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const totalSize = resources.reduce((sum, resource) => sum + (resource.transferSize || 0), 0);
  const jsSize = resources
    .filter(r => r.name.includes('.js'))
    .reduce((sum, r) => sum + (r.transferSize || 0), 0);

  console.log('[Performance] Resources:', {
    total: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
    js: `${(jsSize / 1024 / 1024).toFixed(2)} MB`,
    count: resources.length,
  });

  // Monitora memoria (solo Chrome/Edge)
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    console.log('[Performance] Memory:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
    });

    // Alert se uso memoria > 100MB
    if (memory.usedJSHeapSize > 100 * 1024 * 1024) {
      console.warn('[Performance] HIGH MEMORY USAGE:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
      });
    }
  }
}

/**
 * Hook per monitorare rendering components
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return {
    end: () => {
      const duration = performance.now() - startTime;
      if (duration > 50) {
        console.warn(`[Performance] SLOW RENDER ${componentName}: ${duration.toFixed(2)}ms`);
      }
    },
  };
}

/**
 * Verifica performance periodicamente
 */
export function startPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Check ogni 30 secondi
  setInterval(() => {
    trackResourceMetrics();
  }, 30000);

  // Check iniziale dopo 5 secondi
  setTimeout(() => {
    trackResourceMetrics();
  }, 5000);
}
