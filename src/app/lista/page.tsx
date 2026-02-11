'use client';

import type { ComponentPropsWithoutRef, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, Download, Upload, ArrowLeft } from 'lucide-react';

type ListEntry = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  gender: string;
  status: string;
  plusOne: boolean;
  createdAt: string;
  tickets: { id: string; code: string; status: string }[];
};

type List = {
  id: string;
  name: string;
  type: string;
  quotaTotal?: number | null;
  quotaFemale?: number | null;
  quotaMale?: number | null;
  _count: {
    entries: number;
  };
};

type ListFilters = {
  search: string;
  gender: string;
  status: string;
  page: number;
};

const cn = (...classes: (string | null | undefined | false)[]) =>
  classes.filter(Boolean).join(' ');

const formatGender = (value: string) => {
  switch (value) {
    case 'F':
      return 'Femmina';
    case 'M':
      return 'Maschio';
    case 'NB':
      return 'Non binario';
    case 'UNK':
      return 'Non specificato';
    default:
      return 'N/D';
  }
};

type TableProps = ComponentPropsWithoutRef<'table'>;
type TableHeaderProps = ComponentPropsWithoutRef<'thead'>;
type TableBodyProps = ComponentPropsWithoutRef<'tbody'>;
type TableRowProps = ComponentPropsWithoutRef<'tr'>;
type TableHeadProps = ComponentPropsWithoutRef<'th'>;
type TableCellProps = ComponentPropsWithoutRef<'td'>;

function Table({ className, children, ...props }: TableProps) {
  return (
    <table
      className={cn('w-full caption-bottom text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </table>
  );
}

function TableHeader({ className, children, ...props }: TableHeaderProps) {
  return (
    <thead className={cn('[&_tr]:border-b border-border', className)} {...props}>
      {children}
    </thead>
  );
}

function TableBody({ className, children, ...props }: TableBodyProps) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props}>
      {children}
    </tbody>
  );
}

function TableRow({ className, children, ...props }: TableRowProps) {
  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-card/50 data-[state=selected]:bg-card/80',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

function TableHead({ className, children, ...props }: TableHeadProps) {
  return (
    <th
      className={cn(
        'h-11 px-3 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ className, children, ...props }: TableCellProps) {
  return (
    <td className={cn('px-3 py-3 align-middle text-sm text-foreground', className)} {...props}>
      {children}
    </td>
  );
}

async function fetchMyLists() {
  const res = await fetch('/api/lists');
  if (!res.ok) throw new Error('Failed to fetch lists');
  return res.json();
}

async function fetchListEntries(listId: string, filters: ListFilters) {
  const params = new URLSearchParams();

  if (filters.search) params.set('search', filters.search);
  if (filters.gender) params.set('gender', filters.gender);
  if (filters.status) params.set('status', filters.status);
  params.set('page', String(filters.page));

  const queryString = params.toString();
  const res = await fetch(
    `/api/lists/${listId}/entries${queryString ? `?${queryString}` : ''}`
  );
  if (!res.ok) throw new Error('Failed to fetch entries');
  return res.json();
}

async function addListEntry(listId: string, entry: any) {
  const res = await fetch(`/api/lists/${listId}/entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Failed to add entry');
  return res.json();
}

function AddEntryForm({
  listId,
  onSuccess,
}: {
  listId: string;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'UNK',
    plusOne: false,
  });

  const mutation = useMutation({
    mutationFn: (entry: any) => addListEntry(listId, entry),
    onSuccess: () => {
      toast({
        title: 'Successo',
        description: 'Persona aggiunta alla lista',
      });
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gender: 'UNK',
        plusOne: false,
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: 'Errore',
        description: 'Impossibile aggiungere la persona',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Nome *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            required
            className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Cognome *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            required
            className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Genere</Label>
        <Select
          value={formData.gender}
          onValueChange={(value: string) =>
            setFormData({ ...formData, gender: value })
          }
        >
          <SelectTrigger className="border-border bg-card/50 text-foreground">
            <SelectValue placeholder="Genere" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="F">Femmina</SelectItem>
            <SelectItem value="M">Maschio</SelectItem>
            <SelectItem value="NB">Non binario</SelectItem>
            <SelectItem value="UNK">Non specificato</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Aggiungi persona
      </Button>
    </form>
  );
}

export default function ListaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListFilters>({
    search: '',
    gender: '',
    status: '',
    page: 1,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login' as Route);
    }
  }, [status, router]);

  const { data: listsData } = useQuery({
    queryKey: ['my-lists'],
    queryFn: fetchMyLists,
    enabled: !!session?.user,
  });

  const { data: entriesData, isLoading: entriesLoading } = useQuery({
    queryKey: ['list-entries', selectedListId, filters],
    queryFn: () => fetchListEntries(selectedListId!, filters),
    enabled: !!selectedListId,
  });

  const lists: List[] = listsData?.data?.lists || [];
  const entries: ListEntry[] = entriesData?.data?.entries || [];
  const selectedList = lists.find((l) => l.id === selectedListId);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Gradienti animati di sfondo */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="mb-12 flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Indietro
          </button>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border glass px-4 py-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-primary" />
            Liste ospiti
          </div>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight gradient-text">Gestisci le tue liste</h1>
            <p className="mt-2 max-w-2xl text-base text-muted-foreground">
              Organizza gli ospiti, gestisci le quote e tieni traccia delle conferme in tempo reale.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-1">
            <Card className="border border-border bg-card/50 text-card-foreground backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Liste</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Seleziona una lista per visualizzare gli ospiti
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {lists.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nessuna lista disponibile</p>
                ) : (
                  lists.map((list) => (
                    <Button
                      key={list.id}
                      className={cn(
                        'w-full justify-start rounded-lg border border-border bg-card/50 text-left text-foreground transition hover:bg-card/80',
                        selectedListId === list.id && 'border-accent/30 bg-accent/15 shadow-lg shadow-accent/10'
                      )}
                      onClick={() => setSelectedListId(list.id)}
                    >
                      <Users className="mr-3 h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium leading-tight">{list.name}</div>
                        <div className="text-xs text-muted-foreground">{list._count.entries} persone</div>
                      </div>
                    </Button>
                  ))
                )}
              </CardContent>
            </Card>

            {selectedList && (
              <Card className="border border-border bg-card/50 text-card-foreground backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Aggiungi persona</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Inserisci un ospite manualmente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AddEntryForm
                    listId={selectedListId!}
                    onSuccess={() => {
                      queryClient.invalidateQueries({
                        queryKey: ['list-entries', selectedListId],
                      });
                      queryClient.invalidateQueries({
                        queryKey: ['my-lists'],
                      });
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-3">
            {!selectedListId ? (
              <Card className="border border-border bg-card/50 p-10 text-card-foreground backdrop-blur-xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl font-semibold">Seleziona una lista</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Scegli una lista dalla barra laterale per visualizzare e gestire gli ospiti
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <Card className="border border-border bg-card/50 text-card-foreground backdrop-blur-xl">
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="text-2xl font-semibold tracking-tight">{selectedList?.name}</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        {entries.length} persone in lista
                        {selectedList?.quotaTotal && ` / ${selectedList.quotaTotal} quota massima`}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-border bg-card/50 text-foreground hover:bg-card/80"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Importa
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="border border-border bg-card/50 text-foreground hover:bg-card/80"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Esporta
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Cerca per nome, email, telefono..."
                        value={filters.search}
                        onChange={(e) =>
                          setFilters({ ...filters, search: e.target.value, page: 1 })
                        }
                        className="border-border bg-card/50 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/40"
                      />
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Select
                        value={filters.gender}
                        onValueChange={(value: string) =>
                          setFilters({ ...filters, gender: value, page: 1 })
                        }
                      >
                        <SelectTrigger className="w-[180px] border-border bg-card/50 text-foreground">
                          <SelectValue placeholder="Genere" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tutti</SelectItem>
                          <SelectItem value="F">Femmina</SelectItem>
                          <SelectItem value="M">Maschio</SelectItem>
                          <SelectItem value="NB">Non binario</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={filters.status}
                        onValueChange={(value: string) =>
                          setFilters({ ...filters, status: value, page: 1 })
                        }
                      >
                        <SelectTrigger className="w-[180px] border-border bg-card/50 text-foreground">
                          <SelectValue placeholder="Stato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tutti</SelectItem>
                          <SelectItem value="CONFIRMED">Confermati</SelectItem>
                          <SelectItem value="PENDING">In attesa</SelectItem>
                          <SelectItem value="REJECTED">Rifiutati</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-border">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Contatti</TableHead>
                          <TableHead>Genere</TableHead>
                          <TableHead>Stato</TableHead>
                          <TableHead>Biglietti</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {entriesLoading ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                              Caricamento...
                            </TableCell>
                          </TableRow>
                        ) : entries.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                              Nessuna persona in lista
                            </TableCell>
                          </TableRow>
                        ) : (
                          entries.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell className="font-medium text-foreground">
                                {entry.firstName} {entry.lastName}
                                {entry.plusOne && (
                                  <span className="ml-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
                                    +1
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {entry.email && <div>{entry.email}</div>}
                                {entry.phone && <div>{entry.phone}</div>}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatGender(entry.gender)}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    'rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide',
                                    entry.status === 'CONFIRMED'
                                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                                      : entry.status === 'REJECTED'
                                      ? 'border-red-400/30 bg-red-400/10 text-red-200'
                                      : 'border-amber-400/30 bg-amber-400/10 text-amber-200'
                                  )}
                                >
                                  {entry.status}
                                </span>
                              </TableCell>
                              <TableCell>
                                {entry.tickets.length > 0 ? (
                                  <span className="text-sm text-foreground">
                                    {entry.tickets.length} biglietto/i
                                  </span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
