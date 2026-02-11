'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Trash2, Shield, FileText } from 'lucide-react';

export default function GDPRSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [consents, setConsents] = useState({
    MARKETING_EMAIL: true,
    MARKETING_SMS: false,
    PROFILING: true,
    THIRD_PARTY_SHARING: false,
    ANALYTICS: true,
  });

  const handleExportData = async () => {
    try {
      setLoading(true);
      // TODO: Collegare al guest ID dell'utente loggato
      const guestId = 'guest-id-placeholder';
      
      const response = await fetch(`/api/gdpr/export?guestId=${guestId}`);
      
      if (!response.ok) {
        throw new Error('Errore durante l\'esportazione');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `my-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Errore export:', error);
      alert('Errore durante l\'esportazione dei dati');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!confirm('Sei sicuro di voler richiedere la cancellazione dei tuoi dati? Questa azione non è reversibile.')) {
      return;
    }

    try {
      setLoading(true);
      const guestId = 'guest-id-placeholder';
      
      const response = await fetch('/api/gdpr/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Richiesta di cancellazione registrata. Riceverai una email di conferma.');
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Errore delete:', error);
      alert('Errore durante la richiesta di cancellazione');
    } finally {
      setLoading(false);
    }
  };

  const handleConsentToggle = async (type: string, value: boolean) => {
    try {
      const guestId = 'guest-id-placeholder';
      
      const response = await fetch('/api/gdpr/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestId,
          consentType: type,
          granted: value,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setConsents(prev => ({ ...prev, [type]: value }));
      } else {
        throw new Error(data.error);
      }

    } catch (error) {
      console.error('Errore consent:', error);
      alert('Errore durante l\'aggiornamento del consenso');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Privacy e GDPR</h1>
        <p className="text-muted-foreground mt-2">
          Gestisci i tuoi dati personali e le preferenze sulla privacy
        </p>
      </div>

      <div className="space-y-6">
        {/* Esportazione Dati */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Esporta i Tuoi Dati
            </CardTitle>
            <CardDescription>
              Scarica una copia di tutti i dati che abbiamo su di te (Art. 15 GDPR)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Il file includerà: dati personali, storico eventi, biglietti, feedback, preferenze e consensi.
            </p>
            <Button
              onClick={handleExportData}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              <Download className="w-4 h-4 mr-2" />
              {loading ? 'Esportazione...' : 'Scarica i Miei Dati'}
            </Button>
          </CardContent>
        </Card>

        {/* Gestione Consensi */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Gestione Consensi
            </CardTitle>
            <CardDescription>
              Controlla come utilizziamo i tuoi dati
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <ConsentToggle
                label="Email Marketing"
                description="Ricevi email su eventi e promozioni"
                checked={consents.MARKETING_EMAIL}
                onChange={(v) => handleConsentToggle('MARKETING_EMAIL', v)}
              />
              <ConsentToggle
                label="SMS Marketing"
                description="Ricevi SMS su eventi e promozioni"
                checked={consents.MARKETING_SMS}
                onChange={(v) => handleConsentToggle('MARKETING_SMS', v)}
              />
              <ConsentToggle
                label="Profilazione"
                description="Analisi del comportamento per offerte personalizzate"
                checked={consents.PROFILING}
                onChange={(v) => handleConsentToggle('PROFILING', v)}
              />
              <ConsentToggle
                label="Condivisione Terze Parti"
                description="Condivisione dati con partner selezionati"
                checked={consents.THIRD_PARTY_SHARING}
                onChange={(v) => handleConsentToggle('THIRD_PARTY_SHARING', v)}
              />
              <ConsentToggle
                label="Analytics"
                description="Raccolta dati per migliorare il servizio"
                checked={consents.ANALYTICS}
                onChange={(v) => handleConsentToggle('ANALYTICS', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cancellazione Dati */}
        <Card className="glass border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Cancella i Miei Dati
            </CardTitle>
            <CardDescription>
              Richiedi la cancellazione permanente del tuo account (Art. 17 GDPR)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              La richiesta sarà processata entro 30 giorni. Tutti i tuoi dati personali 
              saranno rimossi o anonimizzati. Questa azione è irreversibile.
            </p>
            <Button
              onClick={handleDeleteRequest}
              disabled={loading}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Richiedi Cancellazione
            </Button>
          </CardContent>
        </Card>

        {/* Link Documenti */}
        <Card className="glass border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documenti Legali
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/privacy-policy" className="block text-primary hover:underline">
              Privacy Policy
            </a>
            <a href="/terms-of-service" className="block text-primary hover:underline">
              Termini di Servizio
            </a>
            <a href="/cookie-policy" className="block text-primary hover:underline">
              Cookie Policy
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConsentToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between p-4 rounded-lg border border-border hover:border-primary/50 transition-colors">
      <div className="flex-1">
        <h4 className="font-medium">{label}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
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
