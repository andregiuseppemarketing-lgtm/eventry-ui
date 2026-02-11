'use client';

import { useMemo } from 'react';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

export function PasswordStrengthIndicator({ 
  password, 
  showRequirements = true 
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };

    let score = 0;
    
    // Lunghezza minima
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Contiene maiuscola
    if (/[A-Z]/.test(password)) score++;
    
    // Contiene minuscola
    if (/[a-z]/.test(password)) score++;
    
    // Contiene numero
    if (/[0-9]/.test(password)) score++;
    
    // Contiene carattere speciale
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return { score, label: 'Debole', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { score, label: 'Media', color: 'bg-yellow-500' };
    } else {
      return { score, label: 'Forte', color: 'bg-green-500' };
    }
  }, [password]);

  const requirements = useMemo(() => [
    {
      label: 'Almeno 8 caratteri',
      met: password.length >= 8,
    },
    {
      label: 'Una lettera maiuscola (A-Z)',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'Una lettera minuscola (a-z)',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Un numero (0-9)',
      met: /[0-9]/.test(password),
    },
  ], [password]);

  const allRequirementsMet = requirements.every(req => req.met);

  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Barra di forza */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Forza password:
          </span>
          {strength.label && (
            <span className={`text-xs font-semibold ${
              strength.label === 'Debole' ? 'text-red-500' :
              strength.label === 'Media' ? 'text-yellow-500' :
              'text-green-500'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
        
        {/* Progress bar */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i <= strength.score ? strength.color : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requisiti */}
      {showRequirements && (
        <div className="space-y-1.5 text-xs">
          {requirements.map((req, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 transition-colors ${
                req.met ? 'text-green-500' : 'text-muted-foreground'
              }`}
            >
              {req.met ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
              ) : (
                <X className="w-3.5 h-3.5 flex-shrink-0" />
              )}
              <span>{req.label}</span>
            </div>
          ))}
          
          {/* Suggerimento bonus */}
          {!allRequirementsMet && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-muted-foreground italic">
                💡 Tip: Usa una frase facile da ricordare con numeri e maiuscole
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
