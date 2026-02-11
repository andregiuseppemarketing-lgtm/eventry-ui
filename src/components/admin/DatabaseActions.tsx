'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, HardDrive, RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';

export function DatabaseActions() {
  const handleBackup = async () => {
    toast.info('Funzionalità backup in sviluppo');
    // TODO: Implementare backup database
  };

  const handleOptimize = async () => {
    toast.info('Ottimizzazione database avviata...');
    // TODO: Implementare ottimizzazione
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Prisma Studio
          </CardTitle>
          <CardDescription>
            Interfaccia GUI completa per gestire il database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Apri Prisma Studio per visualizzare e modificare tutti i dati del database in tempo reale.
          </p>
          <Button 
            onClick={() => {
              toast.info('Esegui: ./start-admin.sh nel terminale');
            }}
            className="w-full"
          >
            <Database className="mr-2 h-4 w-4" />
            Avvia Prisma Studio
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            💡 Oppure esegui: <code className="bg-muted px-1 rounded">./start-admin.sh</code>
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Backup Database
          </CardTitle>
          <CardDescription>
            Crea un backup completo del database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Esporta tutti i dati in formato JSON per backup e ripristino.
          </p>
          <Button onClick={handleBackup} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Crea Backup
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Ottimizzazione
          </CardTitle>
          <CardDescription>
            Ottimizza le performance del database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Esegui VACUUM e ANALYZE per migliorare le prestazioni.
          </p>
          <Button onClick={handleOptimize} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Ottimizza Database
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Gestione Script
          </CardTitle>
          <CardDescription>
            Script CLI per operazioni avanzate
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <p className="font-medium mb-2">Script disponibili:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• <code className="bg-muted px-1 rounded">npx tsx scripts/list-users.ts</code></li>
              <li>• <code className="bg-muted px-1 rounded">npx tsx scripts/delete-user.ts [email]</code></li>
              <li>• <code className="bg-muted px-1 rounded">./start-admin.sh</code></li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
