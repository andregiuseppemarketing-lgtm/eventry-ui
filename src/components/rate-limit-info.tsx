/**
 * Rate Limit Info Component
 * Mostra informazioni sui limiti di upload
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle } from 'lucide-react';

interface RateLimitInfoProps {
  hourlyRemaining?: number;
  dailyRemaining?: number;
  resetAt?: number;
  error?: string;
}

export function RateLimitInfo({ 
  hourlyRemaining = 3, 
  dailyRemaining = 10,
  resetAt,
  error 
}: RateLimitInfoProps) {
  if (error) {
    return (
      <Alert className="border-red-500/50 bg-red-950/20">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-200">
          {error}
        </AlertDescription>
      </Alert>
    );
  }

  const isLowOnHourly = hourlyRemaining <= 1;
  const isLowOnDaily = dailyRemaining <= 3;

  if (!isLowOnHourly && !isLowOnDaily) {
    return null; // Don't show if plenty of quota left
  }

  return (
    <Alert className="border-yellow-500/50 bg-yellow-950/20">
      <Clock className="h-4 w-4 text-yellow-500" />
      <AlertDescription className="text-yellow-200">
        <strong>Limiti upload:</strong> {hourlyRemaining} rimanenti questa ora, {dailyRemaining} oggi.
        {resetAt && (
          <span className="ml-2 text-xs text-yellow-300/80">
            Reset: {new Date(resetAt).toLocaleTimeString('it-IT')}
          </span>
        )}
      </AlertDescription>
    </Alert>
  );
}
