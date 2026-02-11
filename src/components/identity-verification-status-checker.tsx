/**
 * Identity Verification Status Checker
 * Controlla periodicamente lo stato della verifica e mostra toast quando cambia
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

const POLL_INTERVAL = 30000; // 30 secondi

export function IdentityVerificationStatusChecker() {
  const { data: session, update } = useSession();
  const { toast } = useToast();
  const lastStatusRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Salva lo stato iniziale
    if (lastStatusRef.current === null) {
      lastStatusRef.current = session.user.identityVerified || false;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const newSession = await response.json();

        const newVerifiedStatus = newSession?.user?.identityVerified || false;
        
        // Se lo stato è cambiato da false a true, mostra toast
        if (lastStatusRef.current === false && newVerifiedStatus === true) {
          toast({
            title: '✅ Identità Verificata!',
            description: 'La tua identità è stata approvata. Ora hai accesso a tutte le funzionalità.',
            duration: 10000,
          });

          // Aggiorna sessione
          await update();
        }

        lastStatusRef.current = newVerifiedStatus;
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    // Controlla ogni 30 secondi
    const interval = setInterval(checkStatus, POLL_INTERVAL);

    // Cleanup
    return () => clearInterval(interval);
  }, [session?.user?.id, toast, update]);

  // Non renderizza nulla
  return null;
}
