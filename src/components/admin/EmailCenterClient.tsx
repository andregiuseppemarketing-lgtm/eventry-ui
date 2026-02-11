/**
 * MILESTONE 7 - Email Center Client Component
 * Log email inviate, filtri, azioni
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

type EmailLog = {
  id: string;
  recipient: string;
  subject: string;
  type: string;
  status: string;
  error: string | null;
  sentAt: Date;
  resendId: string | null;
};

export function EmailCenterClient() {
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        type: typeFilter,
      });

      const res = await fetch(`/api/admin/emails?${params}`);
      if (!res.ok) throw new Error('Failed to fetch emails');

      const data = await res.json();
      setEmails(data.emails);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i log email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [statusFilter, typeFilter]);

  const handleTestEmail = async () => {
    if (!confirm('Inviare una email di test?')) return;

    try {
      const res = await fetch('/api/admin/emails/test', {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to send test email');

      toast({
        title: 'Email inviata',
        description: 'Email di test inviata con successo',
      });

      fetchEmails();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile inviare email di test',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'sent' ? 'default' : 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Filters & Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri e Azioni</CardTitle>
          <CardDescription>Filtra log email e test invio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Stato</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli stati" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti</SelectItem>
                  <SelectItem value="sent">Inviate</SelectItem>
                  <SelectItem value="failed">Fallite</SelectItem>
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
                  <SelectItem value="ALL">Tutti</SelectItem>
                  <SelectItem value="reset_password">Reset Password</SelectItem>
                  <SelectItem value="ticket_confirmation">Conferma Ticket</SelectItem>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleTestEmail} className="w-full">
                📧 Invia Email Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Email ({emails.length})</CardTitle>
          <CardDescription>Ultimi 100 invii</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Caricamento...</p>
          ) : emails.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Nessuna email registrata
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Oggetto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Resend ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-mono text-xs">
                        {email.recipient}
                      </TableCell>
                      <TableCell className="text-sm">{email.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{email.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(email.status)}>
                          {email.status}
                        </Badge>
                        {email.error && (
                          <p className="text-xs text-destructive mt-1">
                            {email.error}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(email.sentAt), 'dd MMM yyyy HH:mm:ss', {
                          locale: it,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {email.resendId || '-'}
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
