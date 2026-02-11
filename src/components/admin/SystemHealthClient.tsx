/**
 * MILESTONE 7 - System Health Client Component
 * Env vars, DB status, versioni, errori
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type SystemHealth = {
  environment: {
    DATABASE_URL: boolean;
    NEXTAUTH_URL: boolean;
    NEXTAUTH_SECRET: boolean;
    RESEND_API_KEY: boolean;
    STRIPE_SECRET_KEY: boolean;
  };
  versions: {
    nextjs: string;
    prisma: string;
    node: string;
  };
  database: {
    connected: boolean;
    userCount: number;
    eventCount: number;
    ticketCount: number;
  };
  lastErrors: Array<{
    message: string;
    timestamp: Date;
  }>;
};

export function SystemHealthClient() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system/health');
      if (!res.ok) throw new Error('Failed to fetch health');

      const data = await res.json();
      setHealth(data);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare stato sistema',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Caricamento stato sistema...</p>
      </div>
    );
  }

  if (!health) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Impossibile caricare dati</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Environment Variables */}
      <Card>
        <CardHeader>
          <CardTitle>🔑 Variabili Ambiente</CardTitle>
          <CardDescription>Configurazione sistema (presenti/mancanti)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {Object.entries(health.environment).map(([key, present]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded">
                <span className="font-mono text-sm">{key}</span>
                <Badge variant={present ? 'default' : 'destructive'}>
                  {present ? '✓ Presente' : '✗ Mancante'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Versions */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Versioni</CardTitle>
          <CardDescription>Stack tecnologico attivo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Next.js</span>
              <Badge variant="outline">{health.versions.nextjs}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Prisma</span>
              <Badge variant="outline">{health.versions.prisma}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Node.js</span>
              <Badge variant="outline">{health.versions.node}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Status */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Database Status</CardTitle>
          <CardDescription>Connessione e statistiche</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <span className="font-medium">Connessione</span>
              <Badge variant={health.database.connected ? 'default' : 'destructive'}>
                {health.database.connected ? '✓ Connesso' : '✗ Offline'}
              </Badge>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold">{health.database.userCount}</p>
                <p className="text-sm text-muted-foreground">Utenti</p>
              </div>
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold">{health.database.eventCount}</p>
                <p className="text-sm text-muted-foreground">Eventi</p>
              </div>
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold">{health.database.ticketCount}</p>
                <p className="text-sm text-muted-foreground">Ticket</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Errors */}
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Ultimi Errori Runtime</CardTitle>
          <CardDescription>Log errori applicazione</CardDescription>
        </CardHeader>
        <CardContent>
          {health.lastErrors.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              ✅ Nessun errore recente
            </p>
          ) : (
            <div className="space-y-2">
              {health.lastErrors.map((error, idx) => (
                <div key={idx} className="p-3 border border-destructive rounded">
                  <p className="text-sm font-mono text-destructive">
                    {error.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(error.timestamp).toLocaleString('it-IT')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={fetchHealth} variant="outline">
          🔄 Aggiorna Stato
        </Button>
      </div>
    </div>
  );
}
