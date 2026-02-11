'use client';

import { useEffect, useCallback, useRef } from 'react';

// Genera session ID univoco per la sessione utente
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('funnel_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('funnel_session_id', sessionId);
  }
  return sessionId;
};

interface TrackingData {
  step: 'view' | 'click' | 'form_start' | 'form_complete' | 'ticket_issued';
  guestEmail?: string;
  guestPhone?: string;
  metadata?: Record<string, any>;
}

export function useFunnelTracking(eventId?: string) {
  const trackedSteps = useRef(new Set<string>());

  const trackStep = useCallback(async (data: TrackingData) => {
    if (!eventId) return;

    const sessionId = getSessionId();
    const stepKey = `${sessionId}_${data.step}`;

    // Evita duplicati nella stessa sessione
    if (trackedSteps.current.has(stepKey)) {
      return;
    }

    trackedSteps.current.add(stepKey);

    try {
      await fetch('/api/funnel/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          eventId,
          step: data.step,
          guestEmail: data.guestEmail,
          guestPhone: data.guestPhone,
          metadata: data.metadata,
        }),
      });
    } catch (error) {
      console.error('Errore tracking funnel:', error);
    }
  }, [eventId]);

  // Auto-track view quando il componente monta
  useEffect(() => {
    if (eventId) {
      trackStep({ step: 'view' });
    }
  }, [eventId, trackStep]);

  return { trackStep };
}

// Hook semplificato per tracking specifico
export function useTrackView(eventId?: string) {
  const { trackStep } = useFunnelTracking(eventId);
  
  useEffect(() => {
    if (eventId) {
      trackStep({ step: 'view' });
    }
  }, [eventId, trackStep]);
}

export function useTrackClick(eventId?: string, metadata?: Record<string, any>) {
  const { trackStep } = useFunnelTracking(eventId);
  
  return useCallback(() => {
    if (eventId) {
      trackStep({ step: 'click', metadata });
    }
  }, [eventId, metadata, trackStep]);
}

export function useTrackFormStart(eventId?: string) {
  const { trackStep } = useFunnelTracking(eventId);
  
  return useCallback(() => {
    if (eventId) {
      trackStep({ step: 'form_start' });
    }
  }, [eventId, trackStep]);
}

export function useTrackFormComplete(eventId?: string, guestEmail?: string, guestPhone?: string) {
  const { trackStep } = useFunnelTracking(eventId);
  
  return useCallback(() => {
    if (eventId) {
      trackStep({ 
        step: 'form_complete',
        guestEmail,
        guestPhone,
      });
    }
  }, [eventId, guestEmail, guestPhone, trackStep]);
}

export function useTrackTicketIssued(eventId?: string, guestEmail?: string, guestPhone?: string) {
  const { trackStep } = useFunnelTracking(eventId);
  
  return useCallback(() => {
    if (eventId) {
      trackStep({ 
        step: 'ticket_issued',
        guestEmail,
        guestPhone,
      });
    }
  }, [eventId, guestEmail, guestPhone, trackStep]);
}
