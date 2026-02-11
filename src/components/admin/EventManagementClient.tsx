/**
 * MILESTONE 7 - Event Management Client Component
 * Lista eventi, filtri, azioni admin
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import Link from 'next/link';

type Event = {
  id: string;
  title: string;
  status: string;
  ticketType: string;
  dateStart: Date;
  maxGuests: number | null;
  createdBy: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  _count: {
    tickets: number;
  };
};

export function EventManagementClient() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/admin/events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');

      const data = await res.json();
      setEvents(data.events);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli eventi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchQuery, statusFilter, typeFilter]);

  const handleChangeStatus = async (eventId: string, newStatus: string) => {
    if (!confirm(`Cambiare stato evento in ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to change status');

      toast({
        title: 'Stato aggiornato',
        description: `Evento ora è ${newStatus}`,
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile cambiare stato',
        variant: 'destructive',
      });
    }
  };

  const handleForceClose = async (eventId: string) => {
    if (!confirm('Chiudere forzatamente questo evento? Azione irreversibile.')) return;

    try {
      const res = await fetch(`/api/admin/events/${eventId}/force-close`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to close event');

      toast({
        title: 'Evento chiuso',
        description: 'Evento chiuso con successo',
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile chiudere evento',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'default';
      case 'DRAFT':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeBadge = (type: string) => {
    const labels: Record<string, string> = {
      FREE_LIST: 'Free List',
      DOOR_ONLY: 'Door Only',
      PRE_SALE: 'Pre-Sale',
      FULL_TICKET: 'Full Ticket',
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
          <CardDescription>Cerca e filtra eventi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Cerca evento</label>
              <Input
                placeholder="Nome evento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Stato</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti gli stati</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti i tipi</SelectItem>
                  <SelectItem value="FREE_LIST">Free List</SelectItem>
                  <SelectItem value="DOOR_ONLY">Door Only</SelectItem>
                  <SelectItem value="PRE_SALE">Pre-Sale</SelectItem>
                  <SelectItem value="FULL_TICKET">Full Ticket</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Eventi ({events.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Caricamento...</p>
          ) : events.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nessun evento trovato</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Creatore</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Link
                          href={`/eventi/${event.id}`}
                          className="font-medium hover:underline"
                          target="_blank"
                        >
                          {event.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTypeBadge(event.ticketType)}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(event.dateStart), 'dd MMM yyyy HH:mm', { locale: it })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{event._count.tickets}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {event.createdBy.firstName && event.createdBy.lastName
                          ? `${event.createdBy.firstName} ${event.createdBy.lastName}`
                          : event.createdBy.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={event.status}
                            onValueChange={(value) => handleChangeStatus(event.id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                              <SelectItem value="DRAFT">DRAFT</SelectItem>
                              <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleForceClose(event.id)}
                          >
                            Chiudi
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
