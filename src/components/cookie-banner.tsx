'use client';

import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Sempre true, non modificabile
    functional: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Controlla se l'utente ha già dato il consenso
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs: typeof preferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsVisible(false);
    
    // TODO: Applica le preferenze ai servizi di tracking
    // if (prefs.analytics) {
    //   enableAnalytics();
    // }
    // if (prefs.marketing) {
    //   enableMarketing();
    // }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="glass border border-border rounded-lg shadow-2xl max-w-2xl w-full pointer-events-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Cookie className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold">Cookie e Privacy</h3>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showSettings ? (
            <>
              <p className="text-muted-foreground mb-4">
                Utilizziamo cookie tecnici, funzionali, analitici e di marketing per 
                migliorare la tua esperienza. Puoi accettare tutti i cookie o 
                personalizzare le tue preferenze.
              </p>
              <p className="text-sm text-muted-foreground">
                Consulta la nostra{' '}
                <a href="/cookie-policy" className="text-primary hover:underline">
                  Cookie Policy
                </a>
                {' '}e{' '}
                <a href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </a>
                {' '}per maggiori informazioni.
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <CookieCategory
                title="Cookie Necessari"
                description="Essenziali per il funzionamento del sito. Non possono essere disabilitati."
                checked={preferences.necessary}
                disabled={true}
                onChange={() => {}}
              />
              <CookieCategory
                title="Cookie Funzionali"
                description="Memorizzano preferenze personalizzate (tema, lingua)."
                checked={preferences.functional}
                onChange={(v) => setPreferences(p => ({ ...p, functional: v }))}
              />
              <CookieCategory
                title="Cookie Analytics"
                description="Aiutano a capire come i visitatori utilizzano il sito."
                checked={preferences.analytics}
                onChange={(v) => setPreferences(p => ({ ...p, analytics: v }))}
              />
              <CookieCategory
                title="Cookie Marketing"
                description="Utilizzati per tracciare campagne e mostrare contenuti personalizzati."
                checked={preferences.marketing}
                onChange={(v) => setPreferences(p => ({ ...p, marketing: v }))}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 p-6 border-t border-border">
          {!showSettings ? (
            <>
              <Button
                onClick={acceptAll}
                className="bg-primary hover:bg-primary/90 flex-1"
              >
                Accetta Tutti
              </Button>
              <Button
                onClick={acceptNecessary}
                variant="outline"
                className="flex-1"
              >
                Solo Necessari
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                variant="ghost"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Personalizza
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setShowSettings(false)}
                variant="outline"
                className="flex-1"
              >
                Indietro
              </Button>
              <Button
                onClick={saveCustom}
                className="bg-primary hover:bg-primary/90 flex-1"
              >
                Salva Preferenze
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CookieCategory({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-border">
      <div className="flex-1 pr-4">
        <h4 className="font-medium mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
