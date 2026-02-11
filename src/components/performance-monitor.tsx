/**
 * Hook React per monitorare performance componenti
 */
'use client';

import { useEffect } from 'react';
import { startPerformanceMonitoring, trackPageLoad } from '@/lib/performance-monitor';

export function PerformanceMonitor() {
  useEffect(() => {
    // Avvia monitoraggio
    startPerformanceMonitoring();
    
    // Track page load
    trackPageLoad(window.location.pathname);
  }, []);

  return null;
}
