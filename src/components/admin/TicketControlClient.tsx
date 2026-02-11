/**
 * MILESTONE 7 - Ticket Control Client Component
 * Ricerca biglietti, visualizzazione, azioni admin
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

type Ticket = {
  id: string;
  code: string;
  status: string;
  price: number;
  paymentStatus: string | null;
  checkins: Array<{ scannedAt: Date }>;
  user: {
    email: string;
    firstName: string | null;
    lastName: string | null;
  } | null;
  event: {
    id: string;
    title: string;
    dateStart: Date;
  };
};

export function TicketControlClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'qr' | 'email' | 'event'>('qr');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Errore',
        description: 'Inserisci un termine di ricerca',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        [searchType]: searchQuery,
      });

      const res = await fetch(`/api/admin/tickets/search?${params}`);
      if (!res.ok) throw new Error('Ticket not found');

      const data = await res.json();
      setTicket(data.ticket);
    } catch (error) {
      toast({
        title: 'Non trovato',
        description: 'Nessun biglietto corrispondente',
        variant: 'destructive',
      });
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!ticket || !confirm('Annullare questo biglietto? Azione irreversibile.')) return;

    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/cancel`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to cancel');

      toast({
        title: 'Biglietto annullato',
        description: 'Il biglietto è stato annullato',
      });

      handleSearch(); // Refresh
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile annullare il biglietto',
        variant: 'destructive',
      });
    }
  };

  const handleResetCheckin = async () => {
    if (!ticket || !confirm('Resettare il check-in? Il biglietto tornerà NEW.')) return;

    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/reset-checkin`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to reset');

      toast({
        title: 'Check-in resettato',
        description: 'Il biglietto è di nuovo valido',
      });

      handleSearch(); // Refresh
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile resettare check-in',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW':
      case 'PAID':
        return 'default';
      case 'CHECKED_IN':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Ricerca Biglietto</CardTitle>
          <CardDescription>
            Cerca per QR code, email proprietario o evento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={searchType === 'qr' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('qr')}
            >
              QR Code
            </Button>
            <Button
              variant={searchType === 'email' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('email')}
            >
              Email
            </Button>
            <Button
              variant={searchType === 'event' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchType('event')}
            >
              ID Evento
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder={
                searchType === 'qr'
                  ? 'Inserisci QR code...'
                  : searchType === 'email'
                  ? 'email@example.com'
                  : 'ID evento'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Cercando...' : 'Cerca'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Details */}
      {ticket && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Dettagli Biglietto</CardTitle>
              <Badge variant={getStatusBadgeVariant(ticket.status)}>
                {ticket.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ticket Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID Biglietto
                </label>
                <p className="font-mono text-sm mt-1">{ticket.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  QR Code
                </label>
                <p className="font-mono text-sm mt-1">{ticket.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Prezzo
                </label>
                <p className="text-sm mt-1">€{(ticket.price / 100).toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Pagamento
                </label>
                <p className="text-sm mt-1">
                  {ticket.paymentStatus ? (
                    <Badge variant="outline">{ticket.paymentStatus}</Badge>
                  ) : (
                    'N/A'
                  )}
                </p>
              </div>
            </div>

            {/* Owner Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Proprietario</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="text-sm mt-1">{ticket.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Nome
                  </label>
                  <p className="text-sm mt-1">
                    {ticket.user?.firstName && ticket.user?.lastName
                      ? `${ticket.user.firstName} ${ticket.user.lastName}`
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Evento</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Titolo
                  </label>
                  <p className="text-sm mt-1">{ticket.event.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data
                  </label>
                  <p className="text-sm mt-1">
                    {format(new Date(ticket.event.dateStart), 'dd MMM yyyy HH:mm', {
                      locale: it,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Check-in Info */}
            {ticket.checkins && ticket.checkins.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Check-in</h3>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Data e ora
                  </label>
                  <p className="text-sm mt-1">
                    {format(new Date(ticket.checkins[0].scannedAt), 'dd MMM yyyy HH:mm:ss', {
                      locale: it,
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Admin Actions */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Azioni Admin</h3>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleCancelTicket}
                  disabled={ticket.status === 'CANCELLED'}
                >
                  Annulla Biglietto
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResetCheckin}
                  disabled={ticket.status !== 'CHECKED_IN'}
                >
                  Reset Check-in
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
