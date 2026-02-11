'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Route } from 'next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  UserPlus, 
  Download,
  Filter,
  Instagram,
  MapPin,
  Calendar,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

type CustomerSegment = 'NEW' | 'OCCASIONAL' | 'REGULAR' | 'VIP' | 'DORMANT';

type Guest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  instagram: string | null;
  city: string | null;
  birthDate: string | null;
  customerSegment: CustomerSegment;
  totalEvents: number;
  lastEventDate: string | null;
  _count: {
    listEntries: number;
  };
};

async function fetchGuests(params: URLSearchParams) {
  const res = await fetch(`/api/guests?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch guests');
  return res.json();
}

export default function ClientiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<CustomerSegment | ''>('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(segment && { segment }),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['guests', search, segment, page],
    queryFn: () => fetchGuests(params),
    enabled: !!session,
  });

  if (status === 'unauthenticated') {
    router.push('/auth/login' as Route);
    return null;
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-pulse text-primary">Caricamento...</div>
      </div>
    );
  }

  const guests = data?.data?.guests || [];
  const pagination = data?.data?.pagination || { total: 0, totalPages: 0 };

  const segmentStats = {
    NEW: guests.filter((g: Guest) => g.customerSegment === 'NEW').length,
    REGULAR: guests.filter((g: Guest) => g.customerSegment === 'REGULAR').length,
    VIP: guests.filter((g: Guest) => g.customerSegment === 'VIP').length,
    DORMANT: guests.filter((g: Guest) => g.customerSegment === 'DORMANT').length,
  };

  const getSegmentBadge = (segment: CustomerSegment) => {
    const styles = {
      NEW: 'border-blue-400/30 bg-blue-400/10 text-blue-300',
      OCCASIONAL: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300',
      REGULAR: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
      VIP: 'border-amber-400/30 bg-amber-400/10 text-amber-300',
      DORMANT: 'border-slate-400/30 bg-slate-400/10 text-slate-300',
    };

    const labels = {
      NEW: 'Nuovo',
      OCCASIONAL: 'Occasionale',
      REGULAR: 'Abituale',
      VIP: 'VIP',
      DORMANT: 'Inattivo',
    };

    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${styles[segment]}`}>
        {labels[segment]}
      </span>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Gradienti animati */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <button
                  onClick={() => router.back()}
                  className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Indietro
                </button>
                <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-4 py-1 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  Database Clienti
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl gradient-text">
                  Clienti
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Gestisci e analizza il database clienti con filtri avanzati e segmentazione.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="btn-ghost"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
                <Button
                  asChild
                  className="btn-primary"
                >
                  <Link href="/clienti/nuovo">
                    <UserPlus className="w-4 h-4" />
                    Nuovo Cliente
                  </Link>
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card className="glass border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Totale</p>
                    <p className="text-2xl font-semibold gradient-text">{pagination.total}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary/40" />
                </div>
              </Card>
              <Card className="glass border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Nuovi</p>
                    <p className="text-2xl font-semibold text-blue-400">{segmentStats.NEW}</p>
                  </div>
                  <UserPlus className="w-8 h-8 text-blue-400/40" />
                </div>
              </Card>
              <Card className="glass border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">VIP</p>
                    <p className="text-2xl font-semibold text-amber-400">{segmentStats.VIP}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-amber-400/40" />
                </div>
              </Card>
              <Card className="glass border border-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Inattivi</p>
                    <p className="text-2xl font-semibold text-slate-400">{segmentStats.DORMANT}</p>
                  </div>
                  <Users className="w-8 h-8 text-slate-400/40" />
                </div>
              </Card>
            </div>

            {/* Filtri */}
            <Card className="glass border border-border p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cerca per nome, email, telefono, Instagram..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 bg-card/50 border-border"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={segment === '' ? 'default' : 'outline'}
                    onClick={() => { setSegment(''); setPage(1); }}
                    className={segment === '' ? 'btn-primary' : 'btn-ghost'}
                  >
                    Tutti
                  </Button>
                  <Button
                    variant={segment === 'NEW' ? 'default' : 'outline'}
                    onClick={() => { setSegment('NEW'); setPage(1); }}
                    className={segment === 'NEW' ? 'bg-blue-500 hover:bg-blue-600' : 'btn-ghost'}
                  >
                    Nuovi
                  </Button>
                  <Button
                    variant={segment === 'REGULAR' ? 'default' : 'outline'}
                    onClick={() => { setSegment('REGULAR'); setPage(1); }}
                    className={segment === 'REGULAR' ? 'bg-emerald-500 hover:bg-emerald-600' : 'btn-ghost'}
                  >
                    Abituali
                  </Button>
                  <Button
                    variant={segment === 'VIP' ? 'default' : 'outline'}
                    onClick={() => { setSegment('VIP'); setPage(1); }}
                    className={segment === 'VIP' ? 'bg-amber-500 hover:bg-amber-600' : 'btn-ghost'}
                  >
                    VIP
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tabella */}
            <Card className="glass border border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">
                  {pagination.total} {pagination.total === 1 ? 'Cliente' : 'Clienti'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-border bg-card/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Nome</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Contatti</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Città</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Eventi</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Ultimo</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Segmento</th>
                        <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {guests.map((guest: Guest) => (
                        <tr key={guest.id} className="hover:bg-accent/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">
                                {guest.firstName} {guest.lastName}
                              </span>
                              {guest.instagram && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Instagram className="w-3 h-3" />
                                  @{guest.instagram}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                              {guest.email && <span>{guest.email}</span>}
                              {guest.phone && <span>{guest.phone}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {guest.city && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {guest.city}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-foreground">
                              {guest.totalEvents}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {guest.lastEventDate && (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {new Date(guest.lastEventDate).toLocaleDateString('it-IT')}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {getSegmentBadge(guest.customerSegment)}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              asChild
                              size="sm"
                              variant="ghost"
                              className="btn-ghost"
                            >
                              <Link href={`/clienti/${guest.id}` as Route}>
                                Dettagli
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {guests.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun cliente trovato</p>
                  </div>
                )}

                {/* Paginazione */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                      Pagina {page} di {pagination.totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn-ghost"
                      >
                        Precedente
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                        disabled={page === pagination.totalPages}
                        className="btn-ghost"
                      >
                        Successiva
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
