'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Cpu, Database, Zap } from 'lucide-react';

export function SystemStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Informazioni Server
          </CardTitle>
          <CardDescription>Stato dell'ambiente di produzione</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Next.js:</span>
            <span className="font-medium">16.0.7</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">React:</span>
            <span className="font-medium">19.2.1</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Prisma:</span>
            <span className="font-medium">6.19.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Database:</span>
            <span className="font-medium">PostgreSQL (Neon)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Status
          </CardTitle>
          <CardDescription>Stato della connessione database</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Connessione:</span>
            <span className="font-medium text-green-500">✓ Attiva</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pool Size:</span>
            <span className="font-medium">10</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Timeout:</span>
            <span className="font-medium">5s</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            Performance
          </CardTitle>
          <CardDescription>Metriche di performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Build Time:</span>
            <span className="font-medium">5.6s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Routes:</span>
            <span className="font-medium">86</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">ISR Cache:</span>
            <span className="font-medium text-green-500">✓ Attivo (60s)</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Servizi Esterni
          </CardTitle>
          <CardDescription>Integrazioni e API</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Stripe:</span>
            <span className="font-medium text-green-500">✓ Configurato</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Resend Email:</span>
            <span className="font-medium text-green-500">✓ Attivo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">NextAuth:</span>
            <span className="font-medium text-green-500">✓ Attivo</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Vercel Deploy:</span>
            <span className="font-medium text-green-500">✓ Production</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
