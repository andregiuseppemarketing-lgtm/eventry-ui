'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Route } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Mail, 
  Cake, 
  UserPlus, 
  Star, 
  Send,
  Loader2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

type AutomationType = 'birthday' | 're-engagement' | 'vip' | 'all';

interface AutomationResult {
  success: boolean;
  error?: string;
  sent?: number;
  failed?: number;
}

export default function MarketingAutomationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState<AutomationType | null>(null);
  const [results, setResults] = useState<Record<string, AutomationResult>>({});

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard' as Route);
    }
  }, [status, session, router]);

  const runAutomation = async (type: AutomationType) => {
    setLoading(type);
    
    try {
      const res = await fetch('/api/admin/trigger-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });

      const data = await res.json();

      if (data.success) {
        setResults(prev => ({
          ...prev,
          [type]: { success: true, ...data.results },
        }));
        
        toast({
          title: 'Automazione completata',
          description: `${type === 'all' ? 'Tutte le automazioni' : `Automazione ${type}`} eseguita con successo.`,
        });
      } else {
        throw new Error(data.error || 'Errore sconosciuto');
      }
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [type]: { success: false, error: error instanceof Error ? error.message : 'Errore sconosciuto' },
      }));
      
      toast({
        title: 'Errore',
        description: error instanceof Error ? error.message : 'Errore durante l\'esecuzione dell\'automazione',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  const automations = [
    {
      id: 'birthday' as AutomationType,
      title: 'Notifiche Compleanno',
      description: 'Invia auguri di compleanno ai clienti che compiono gli anni oggi',
      icon: Cake,
      color: 'from-pink-500 to-rose-500',
    },
    {
      id: 're-engagement' as AutomationType,
      title: 'Re-engagement',
      description: 'Campagna per riattivare clienti dormienti (>60 giorni)',
      icon: UserPlus,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'vip' as AutomationType,
      title: 'Promozione VIP',
      description: 'Promuovi automaticamente clienti meritevoli a VIP',
      icon: Star,
      color: 'from-yellow-500 to-amber-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Dashboard
            </Button>
          </Link>
          <h1 className="text-4xl font-bold gradient-text mb-2">Marketing Automation</h1>
          <p className="text-muted-foreground">Gestisci le campagne email automatiche</p>
        </div>

        <div className="space-y-6">
          {/* Esegui tutte le automazioni */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Esegui Tutte le Automazioni
              </CardTitle>
              <CardDescription>
                Avvia simultaneamente tutte le campagne marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => runAutomation('all')}
                disabled={!!loading}
                className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {loading === 'all' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Esecuzione in corso...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Esegui Tutto
                  </>
                )}
              </Button>
              
              {results.all && (
                <div className={`mt-4 p-4 rounded-lg ${results.all.success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <div className="flex items-center gap-2">
                    {results.all.success ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="font-medium text-green-500">Tutte le automazioni completate</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-500" />
                        <span className="font-medium text-red-500">{results.all.error}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Automazioni individuali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {automations.map((automation) => (
              <Card key={automation.id} className="glass border-border group hover:border-primary/40 transition-all">
                <CardHeader>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${automation.color} flex items-center justify-center mb-4`}>
                    <automation.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{automation.title}</CardTitle>
                  <CardDescription className="min-h-[40px]">
                    {automation.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => runAutomation(automation.id)}
                    disabled={!!loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading === automation.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        In corso...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Esegui
                      </>
                    )}
                  </Button>
                  
                  {results[automation.id] && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${results[automation.id].success ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                      {results[automation.id].success ? (
                        <div className="flex items-center gap-2 text-green-500">
                          <CheckCircle className="h-4 w-4" />
                          <span>Completato</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-red-500">
                          <XCircle className="h-4 w-4" />
                          <span>Errore</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Informazioni */}
          <Card className="glass border-border">
            <CardHeader>
              <CardTitle>ℹ️ Informazioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">📧 Provider Email</p>
                <p>Le email vengono inviate tramite Resend. Assicurati di aver configurato <code className="bg-muted px-2 py-1 rounded">RESEND_API_KEY</code> nelle variabili d'ambiente.</p>
              </div>
              
              <div>
                <p className="font-medium text-foreground mb-1">⏰ Automazione Schedulata</p>
                <p>Il sistema esegue automaticamente tutte le campagne ogni giorno alle 9:00 AM tramite Vercel Cron.</p>
              </div>
              
              <div>
                <p className="font-medium text-foreground mb-1">🔒 Sicurezza</p>
                <p>Solo gli utenti con ruolo ADMIN possono accedere a questa pagina e triggerare manualmente le automazioni.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
