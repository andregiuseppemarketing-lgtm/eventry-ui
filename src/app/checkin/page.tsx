'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { Route } from 'next';
import { useEventContext } from '@/hooks/use-event-context';
import { EventSelector } from '@/components/event-selector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle2, XCircle, Loader2, AlertCircle, ArrowLeft, CreditCard, CalendarDays, MapPin } from 'lucide-react';
import { TicketBadge, TicketBadgeType } from '@/components/ticket-badge';
import dynamicImport from 'next/dynamic';

// Import dinamico dello scanner QR per evitare errori SSR e accesso fotocamera
const Scanner = dynamicImport(
  () => import('@yudiel/react-qr-scanner').then((mod) => mod.Scanner),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

type CheckInResult = {
  success: boolean;
  requiresPayment?: boolean;
  isComplimentary?: boolean;
  wrongEvent?: boolean; // Flag per biglietto evento diverso
  ticket?: {
    id: string;
    code: string;
    type: string;
    status: string;
    price?: number;
    currency?: string;
    paid?: boolean;
    isComplimentary?: boolean;
    event?: {
      id: string;
      title: string;
    };
    listEntry?: {
      firstName: string;
      lastName: string;
    };
    user?: {
      name: string;
      email: string;
    };
  };
  message: string;
  error?: string;
};

async function performCheckIn(code: string, gate: string, eventId?: string | null): Promise<CheckInResult> {
  const res = await fetch('/api/tickets/checkin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      ticketCode: code, 
      gate,
      eventId: eventId || undefined // Passa eventId solo se disponibile
    }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    return {
      success: false,
      requiresPayment: data.requiresPayment || false,
      ticket: data.ticket,
      message: data.message || data.error || 'Errore durante il check-in',
      error: data.error,
    };
  }

  return {
    success: true,
    isComplimentary: data.isComplimentary || false,
    ticket: data.ticket,
    message: data.message || 'Check-in effettuato con successo',
  };
}

async function markTicketAsPaid(code: string, amount: number, method: string = 'CASH'): Promise<any> {
  const res = await fetch(`/api/tickets/${code}/mark-paid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, paymentMethod: method }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Errore durante la registrazione del pagamento');
  }

  return res.json();
}

function ScannerView({ onScan, isProcessing, onError }: { 
  onScan: (code: string) => void; 
  isProcessing: boolean;
  onError?: () => void;
}) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-md mx-auto">
      {error ? (
        <div className="aspect-square rounded-lg overflow-hidden border-4 border-destructive bg-destructive/10 flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <AlertCircle className="w-16 h-16 mx-auto text-destructive" />
            <div>
              <h3 className="text-lg font-semibold mb-2">Fotocamera non disponibile</h3>
              <p className="text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="aspect-square rounded-lg overflow-hidden border-4 border-primary">
          <Scanner
            onScan={(result) => {
              if (result && result[0]?.rawValue && !isProcessing) {
                onScan(result[0].rawValue);
              }
            }}
            onError={(err) => {
              console.error('Scanner error:', err);
              setError('Fotocamera non trovata o accesso negato. Usa l\'inserimento manuale.');
              if (onError) {
                setTimeout(() => onError(), 2000);
              }
            }}
            constraints={{
              facingMode: 'environment',
            }}
            styles={{
              container: {
                width: '100%',
                height: '100%',
              },
            }}
          />
        </div>
      )}
      
      {isProcessing && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}
      
      {!error && (
        <div className="absolute top-4 left-4 right-4 text-center">
          <p className="text-white text-sm font-medium bg-black/50 py-2 px-4 rounded-lg">
            Inquadra il codice QR del biglietto
          </p>
        </div>
      )}
    </div>
  );
}

function ManualEntry({ onSubmit, isProcessing }: { 
  onSubmit: (code: string) => void; 
  isProcessing: boolean;
}) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onSubmit(code.trim());
      setCode('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">Codice Biglietto</Label>
        <Input
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Inserisci il codice manualmente"
          disabled={isProcessing}
          autoFocus
        />
      </div>
      <Button type="submit" disabled={!code.trim() || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Verifica in corso...
          </>
        ) : (
          'Verifica Biglietto'
        )}
      </Button>
    </form>
  );
}

function CheckInStatus({ result, onReset }: { 
  result: CheckInResult | null; 
  onReset: () => void;
}) {
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const { toast } = useToast();

  if (!result) return null;

  const handleMarkPaid = async () => {
    if (!result.ticket) return;

    setIsMarkingPaid(true);
    try {
      await markTicketAsPaid(
        result.ticket.code,
        result.ticket.price || 0,
        'CASH'
      );

      toast({
        title: 'Pagamento registrato',
        description: `€${result.ticket.price?.toFixed(2)} pagato con successo`,
      });

      // Aggiorna il risultato per mostrare come pagato
      result.success = true;
      result.requiresPayment = false;
      if (result.ticket) {
        result.ticket.paid = true;
      }
      
      // Reset dopo un momento
      setTimeout(() => {
        onReset();
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Impossibile registrare il pagamento',
        variant: 'destructive',
      });
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Determina il tipo di badge
  let badgeType: TicketBadgeType = 'paid';
  if (result.requiresPayment) {
    badgeType = 'unpaid';
  } else if (result.isComplimentary || result.ticket?.isComplimentary) {
    badgeType = 'complimentary';
  } else if (result.wrongEvent) {
    badgeType = 'cancelled'; // Usa badge cancelled per evento errato (rosso)
  } else if (!result.success && result.error?.includes('già utilizzato')) {
    badgeType = 'used';
  } else if (!result.success && result.error?.includes('annullato')) {
    badgeType = 'cancelled';
  }

  const Icon = result.wrongEvent 
    ? AlertCircle 
    : result.requiresPayment 
      ? CreditCard 
      : result.success 
        ? CheckCircle2 
        : XCircle;
  const colorClass = result.wrongEvent
    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
    : result.requiresPayment 
      ? 'bg-orange-50 border-orange-200'
      : result.success 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200';
  const iconColor = result.wrongEvent
    ? 'text-amber-600 dark:text-amber-500'
    : result.requiresPayment
    ? 'text-orange-600'
    : result.success 
      ? 'text-green-600' 
      : 'text-red-600';

  return (
    <Card className={`${colorClass} border-2`}>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <Icon className={`w-16 h-16 mx-auto ${iconColor}`} />
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">
              {result.wrongEvent
                ? '⚠️ Evento Errato'
                : result.requiresPayment 
                  ? 'Pagamento Richiesto' 
                  : result.success 
                    ? 'Check-in Riuscito!' 
                    : 'Check-in Fallito'}
            </h3>
            <p className="text-muted-foreground">{result.message}</p>
            
            {result.ticket && (
              <div className="flex justify-center">
                <TicketBadge 
                  type={badgeType} 
                  price={result.ticket.price}
                  currency={result.ticket.currency}
                  className="text-lg py-2 px-4"
                />
              </div>
            )}
          </div>

          {result.ticket && (
            <div className="bg-white rounded-lg p-4 space-y-2 text-left">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Codice:</div>
                <div className="font-mono font-medium">{result.ticket.code}</div>
                
                <div className="text-muted-foreground">Tipo:</div>
                <div className="font-medium">{result.ticket.type}</div>
                
                {result.wrongEvent && result.ticket.event && (
                  <>
                    <div className="text-muted-foreground">Evento del biglietto:</div>
                    <div className="font-medium text-amber-700 dark:text-amber-400">
                      {result.ticket.event.title}
                    </div>
                  </>
                )}
                
                {result.ticket.price && (
                  <>
                    <div className="text-muted-foreground">Importo:</div>
                    <div className="font-medium">
                      €{result.ticket.price.toFixed(2)} {result.ticket.currency || 'EUR'}
                    </div>
                  </>
                )}
                
                {result.ticket.listEntry && (
                  <>
                    <div className="text-muted-foreground">Nome:</div>
                    <div className="font-medium">
                      {result.ticket.listEntry.firstName} {result.ticket.listEntry.lastName}
                    </div>
                  </>
                )}
                
                {result.ticket.user && (
                  <>
                    <div className="text-muted-foreground">Utente:</div>
                    <div className="font-medium">{result.ticket.user.name}</div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {result.requiresPayment && result.ticket && (
              <Button 
                onClick={handleMarkPaid} 
                className="w-full bg-orange-600 hover:bg-orange-700"
                disabled={isMarkingPaid}
              >
                {isMarkingPaid ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrazione...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Marca come Pagato (€{result.ticket.price?.toFixed(2)})
                  </>
                )}
              </Button>
            )}
            
            <Button 
              onClick={onReset} 
              variant={result.requiresPayment ? 'outline' : 'default'}
              className="w-full"
            >
              {result.requiresPayment ? 'Annulla' : 'Scansiona Prossimo'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckInPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { selectedEvent, selectedEventId, selectEvent } = useEventContext();
  
  const [mode, setMode] = useState<'scanner' | 'manual'>('scanner');
  const [gate, setGate] = useState('MAIN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [stats, setStats] = useState({ total: 0, recent: 0 });
  const [showCameraError, setShowCameraError] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  // Sync eventId from URL to EventContext
  useEffect(() => {
    const eventIdParam = searchParams.get('eventId');
    if (eventIdParam && eventIdParam !== selectedEventId) {
      selectEvent(eventIdParam);
    }
  }, [searchParams, selectedEventId, selectEvent]);

  useEffect(() => {
    const gateParam = searchParams.get('gate');
    if (gateParam && ['MAIN', 'VIP', 'STAFF'].includes(gateParam)) {
      setGate(gateParam);
    }
  }, [searchParams]);

  const handleCameraError = () => {
    setShowCameraError(true);
    setMode('manual');
    toast({
      title: 'Fotocamera non disponibile',
      description: 'Passaggio automatico alla modalità di inserimento manuale.',
      variant: 'default',
    });
  };

  const handleScan = async (code: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const checkInResult = await performCheckIn(code, gate, selectedEventId);
      setResult(checkInResult);
      
      if (checkInResult.success) {
        setStats(prev => ({ ...prev, total: prev.total + 1, recent: prev.recent + 1 }));
        toast({
          title: 'Check-in Riuscito',
          description: checkInResult.message,
        });
      } else {
        toast({
          title: 'Check-in Fallito',
          description: checkInResult.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorResult: CheckInResult = {
        success: false,
        message: 'Errore di connessione. Riprova.',
      };
      setResult(errorResult);
      toast({
        title: 'Errore',
        description: 'Impossibile effettuare il check-in',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
          <h1 className="text-3xl font-bold mb-2">Check-in</h1>
          <p className="text-muted-foreground">
            Scansiona i biglietti per consentire l'accesso all'evento
          </p>
        </div>

        {/* Event Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Evento Attivo</CardTitle>
            <CardDescription>
              Seleziona l'evento per cui effettuare il check-in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EventSelector position="inline" />
          </CardContent>
        </Card>

        {/* Event Info or Warning */}
        {selectedEvent && selectedEventId ? (
          <Card className="mb-6 glass border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-background">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400 mb-1">
                      ✓ Evento Selezionato
                    </p>
                    <p className="font-bold text-lg">{selectedEvent.title}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {new Date(selectedEvent.dateStart).toLocaleDateString('it-IT', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedEvent.venue.name} - {selectedEvent.venue.city}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    I check-in verranno effettuati per questo evento.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 border-2">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
                    ⚠️ Nessun evento selezionato
                  </p>
                  <p className="text-amber-800 dark:text-amber-300 mb-2">
                    <strong>Attenzione:</strong> Non hai selezionato un evento specifico. 
                    I check-in verranno comunque processati, ma potresti fare check-in 
                    di biglietti per l'evento sbagliato senza accorgertene.
                  </p>
                  <p className="text-amber-700 dark:text-amber-400 text-xs">
                    💡 <strong>Suggerimento:</strong> Seleziona l'evento dall'elenco sopra per evitare errori operativi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Check-in Totali</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Ultimi 5 min</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.recent}</div>
            </CardContent>
          </Card>
        </div>

        {/* Gate selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Ingresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={gate === 'MAIN' ? 'default' : 'outline'}
                onClick={() => setGate('MAIN')}
                className="flex-1"
              >
                Main
              </Button>
              <Button
                variant={gate === 'VIP' ? 'default' : 'outline'}
                onClick={() => setGate('VIP')}
                className="flex-1"
              >
                VIP
              </Button>
              <Button
                variant={gate === 'STAFF' ? 'default' : 'outline'}
                onClick={() => setGate('STAFF')}
                className="flex-1"
              >
                Staff
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={mode === 'scanner' ? 'default' : 'outline'}
            onClick={() => setMode('scanner')}
            className="flex-1"
            disabled={showCameraError}
          >
            <Camera className="mr-2 h-4 w-4" />
            Scanner {showCameraError && '(Non disponibile)'}
          </Button>
          <Button
            variant={mode === 'manual' ? 'default' : 'outline'}
            onClick={() => setMode('manual')}
            className="flex-1"
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Manuale
          </Button>
        </div>

        {showCameraError && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="pt-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-medium">Fotocamera non disponibile</p>
                  <p className="text-amber-800 mt-1">
                    Il tuo dispositivo non ha una fotocamera o l'accesso è stato negato. 
                    Usa la modalità di inserimento manuale per verificare i biglietti.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main content */}
        {result ? (
          <CheckInStatus result={result} onReset={handleReset} />
        ) : (
          <Card>
            <CardContent className="pt-6">
              {mode === 'scanner' ? (
                <ScannerView 
                  onScan={handleScan} 
                  isProcessing={isProcessing}
                  onError={handleCameraError}
                />
              ) : (
                <ManualEntry onSubmit={handleScan} isProcessing={isProcessing} />
              )}
            </CardContent>
          </Card>
        )}

        {/* Help text */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Suggerimenti:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Assicurati di avere una buona illuminazione</li>
                  <li>Tieni il QR code fermo e ben inquadrato</li>
                  <li>Se lo scanner non funziona, usa l'input manuale</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function CheckInPageWrapper() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    }>
      <CheckInPage />
    </Suspense>
  );
}
