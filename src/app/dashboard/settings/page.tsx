'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Route } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User, Mail, Shield } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Errore nell\'aggiornamento del profilo');
      }

      await update();

      toast({
        title: 'Profilo aggiornato',
        description: 'Le tue informazioni sono state salvate con successo.',
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Non è stato possibile aggiornare il profilo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">Impostazioni</h1>
          <p className="text-muted-foreground">Gestisci le preferenze del tuo account</p>
        </div>

        <div className="space-y-6">
          {/* Informazioni Account */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informazioni Account
              </CardTitle>
              <CardDescription>
                Visualizza e modifica le tue informazioni personali
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Il tuo nome"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email non può essere modificata
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informazioni Ruolo */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ruolo e Permessi
              </CardTitle>
              <CardDescription>
                Il tuo ruolo nell'applicazione
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div>
                    <p className="font-medium">Ruolo Attuale</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Questo ruolo determina le tue autorizzazioni nell'applicazione
                    </p>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <span className="font-semibold text-primary">
                      {session.user.role || 'USER'}
                    </span>
                  </div>
                </div>

                {session.user.role === 'ADMIN' && (
                  <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                    <p className="font-medium text-accent mb-2">🎉 Accesso Amministratore</p>
                    <p className="text-sm text-muted-foreground">
                      Hai accesso completo a tutte le funzionalità dell'applicazione, inclusi i club e le verifiche ingressi.
                    </p>
                  </div>
                )}

                {session.user.role === 'PR' && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="font-medium text-blue-500 mb-2">✨ Accesso PR</p>
                    <p className="text-sm text-muted-foreground">
                      Puoi gestire liste e verificare ingressi per gli eventi assegnati.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
