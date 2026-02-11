'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { Route } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Camera, CheckCircle2, XCircle, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
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
  ticket?: {
    id: string;
    code: string;
    type: string;
    status: string;
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
};

async function performCheckIn(code: string, gate: string): Promise<CheckInResult> {
  const res = await fetch('/api/check-in/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, gate }),
  });

  const data = await res.json();
  
  if (!res.ok) {
    return {
      success: false,
      message: data.error || 'Errore durante il check-in',
    };
  }

  return {
    success: true,
    ticket: data.data.ticket,
    message: 'Check-in effettuato con successo',
  };
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
  if (!result) return null;

  const Icon = result.success ? CheckCircle2 : XCircle;
  const colorClass = result.success 
    ? 'bg-green-50 border-green-200' 
    : 'bg-red-50 border-red-200';
  const iconColor = result.success ? 'text-green-600' : 'text-red-600';

  return (
    <Card className={`${colorClass} border-2`}>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <Icon className={`w-16 h-16 mx-auto ${iconColor}`} />
          
          <div>
            <h3 className="text-2xl font-bold mb-2">
              {result.success ? 'Check-in Riuscito!' : 'Check-in Fallito'}
            </h3>
            <p className="text-muted-foreground">{result.message}</p>
          </div>

          {result.success && result.ticket && (
            <div className="bg-white rounded-lg p-4 space-y-2 text-left">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">Codice:</div>
                <div className="font-mono font-medium">{result.ticket.code}</div>
                
                <div className="text-muted-foreground">Tipo:</div>
                <div className="font-medium">{result.ticket.type}</div>
                
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

          <Button onClick={onReset} className="w-full">
            Scansiona Prossimo
          </Button>
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
      const checkInResult = await performCheckIn(code, gate);
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
