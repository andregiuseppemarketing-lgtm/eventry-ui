'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, ArrowLeft, Gift, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PRQuota {
  prUserId: string;
  prName: string;
  max: number;
  used: number;
  available: number;
}

interface EventQuotas {
  organizer: {
    max: number;
    used: number;
    available: number;
  };
  pr: PRQuota[];
  totalUsed: number;
  totalAvailable: number;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ComplimentaryQuotaPage({ params }: PageProps) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [eventId, setEventId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quotas, setQuotas] = useState<EventQuotas | null>(null);
  const [organizerQuota, setOrganizerQuota] = useState(0);
  const [prQuotas, setPRQuotas] = useState<Array<{ prUserId: string; maxFreePasses: number }>>([]);

  useEffect(() => {
    async function initParams() {
      const resolvedParams = await params;
      setEventId(resolvedParams.id);
    }
    initParams();
  }, [params]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated' && eventId) {
      loadQuotas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, eventId]);

  const loadQuotas = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}/complimentary-quota`);
      
      if (!res.ok) {
        throw new Error('Errore nel caricamento delle quote');
      }

      const data: EventQuotas = await res.json();
      setQuotas(data);
      setOrganizerQuota(data.organizer.max);
      setPRQuotas(
        data.pr.map((pr) => ({
          prUserId: pr.prUserId,
          maxFreePasses: pr.max,
        }))
      );
    } catch {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare le quote',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!eventId) return;
    try {
      setSaving(true);

      const res = await fetch(`/api/events/${eventId}/complimentary-quota`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerQuota,
          prQuotas,
        }),
      });

      if (!res.ok) {
        throw new Error('Errore nel salvataggio delle quote');
      }

      const updatedData = await res.json();
      setQuotas(updatedData);

      toast({
        title: 'Salvato',
        description: 'Quote aggiornat con successo',
      });
    } catch {
      toast({
        title: 'Errore',
        description: 'Impossibile salvare le quote',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePRQuota = (prUserId: string, value: number) => {
    setPRQuotas((prev) => {
      const existing = prev.find((q) => q.prUserId === prUserId);
      if (existing) {
        return prev.map((q) =>
          q.prUserId === prUserId ? { ...q, maxFreePasses: value } : q
        );
      } else {
        return [...prev, { prUserId, maxFreePasses: value }];
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!quotas) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Errore nel caricamento dei dati</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
          <h1 className="text-3xl font-bold mb-2">Quote Biglietti Omaggio</h1>
          <p className="text-muted-foreground">
            Gestisci le quote di biglietti omaggio per l&apos;organizzatore e i PR
          </p>
        </div>

        {/* Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              Riepilogo Quote
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{quotas.totalUsed}</div>
                <div className="text-sm text-muted-foreground">Utilizzati</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {quotas.totalAvailable}
                </div>
                <div className="text-sm text-muted-foreground">Disponibili</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {quotas.totalUsed + quotas.totalAvailable}
                </div>
                <div className="text-sm text-muted-foreground">Totale</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organizer Quota */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quota Organizzatore</CardTitle>
            <CardDescription>
              Numero massimo di biglietti omaggio che l&apos;organizzatore può emettere
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="organizer-quota">Quota Massima</Label>
                <Input
                  id="organizer-quota"
                  type="number"
                  min="0"
                  value={organizerQuota}
                  onChange={(e) => setOrganizerQuota(parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Utilizzati</div>
                <div className="text-2xl font-bold">{quotas.organizer.used}</div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Disponibili</div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.max(0, organizerQuota - quotas.organizer.used)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PR Quotas */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Quote PR
            </CardTitle>
            <CardDescription>
              Imposta le quote individuali per ogni PR assegnato all&apos;evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {quotas.pr.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nessun PR assegnato a questo evento
              </p>
            ) : (
              <div className="space-y-4">
                {quotas.pr.map((pr) => {
                  const currentQuota =
                    prQuotas.find((q) => q.prUserId === pr.prUserId)?.maxFreePasses ||
                    pr.max;

                  return (
                    <div
                      key={pr.prUserId}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{pr.prName}</div>
                        <div className="text-sm text-muted-foreground">
                          {pr.used} / {pr.max} utilizzati
                        </div>
                      </div>
                      <div className="w-32">
                        <Label htmlFor={`pr-${pr.prUserId}`} className="text-xs">
                          Quota Max
                        </Label>
                        <Input
                          id={`pr-${pr.prUserId}`}
                          type="number"
                          min="0"
                          value={currentQuota}
                          onChange={(e) =>
                            updatePRQuota(pr.prUserId, parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-xs text-muted-foreground mb-1">
                          Disponibili
                        </div>
                        <Badge
                          variant={
                            Math.max(0, currentQuota - pr.used) > 0
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {Math.max(0, currentQuota - pr.used)}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvataggio...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salva Quote
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
