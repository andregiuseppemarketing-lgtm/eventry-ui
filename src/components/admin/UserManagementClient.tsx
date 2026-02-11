/**
 * MILESTONE 7 - User Management Client Component
 * Lista utenti, ricerca, azioni CRUD
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
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  emailVerified: Date | null;
  identityVerified: boolean;
  createdAt: Date;
  _count?: {
    eventsCreated: number;
    ticketsOwned: number;
  };
};

type UserListResponse = {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
};

export function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        search: searchQuery,
        role: roleFilter,
      });

      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');

      const data: UserListResponse = await res.json();
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile caricare gli utenti',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, searchQuery, roleFilter]);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'utente ${email}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete user');

      toast({
        title: 'Utente eliminato',
        description: `${email} è stato rimosso dal sistema`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile eliminare l\'utente',
        variant: 'destructive',
      });
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to change role');

      toast({
        title: 'Ruolo aggiornato',
        description: `Ruolo cambiato in ${newRole}`,
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile cambiare ruolo',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    if (!confirm(`Inviare email di reset password a ${email}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });

      if (!res.ok) throw new Error('Failed to send reset email');

      toast({
        title: 'Email inviata',
        description: `Email di reset password inviata a ${email}`,
      });
    } catch (error) {
      toast({
        title: 'Errore',
        description: 'Impossibile inviare email',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'ORGANIZER':
        return 'default';
      case 'STAFF':
        return 'secondary';
      case 'PR':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
          <CardDescription>Cerca e filtra utenti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">Cerca per email o nome</label>
              <Input
                placeholder="email@example.com"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Filtra per ruolo</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i ruoli" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tutti i ruoli</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="ORGANIZER">Organizer</SelectItem>
                  <SelectItem value="STAFF">Staff</SelectItem>
                  <SelectItem value="PR">PR</SelectItem>
                  <SelectItem value="USER">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Utenti ({users.length})</CardTitle>
          <CardDescription>
            Pagina {page} di {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Caricamento...</p>
          ) : users.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">Nessun utente trovato</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Ruolo</TableHead>
                    <TableHead>Verificato</TableHead>
                    <TableHead>Eventi</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Registrato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.email}</TableCell>
                      <TableCell>
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {user.emailVerified ? (
                            <Badge variant="outline" className="text-xs">✓ Email</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">✗ Email</Badge>
                          )}
                          {user.identityVerified && (
                            <Badge variant="outline" className="text-xs">✓ ID</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user._count?.eventsCreated || 0}</TableCell>
                      <TableCell>{user._count?.ticketsOwned || 0}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(user.createdAt), {
                          addSuffix: true,
                          locale: it,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleChangeRole(user.id, value)}
                          >
                            <SelectTrigger className="w-[120px] h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USER">USER</SelectItem>
                              <SelectItem value="PR">PR</SelectItem>
                              <SelectItem value="STAFF">STAFF</SelectItem>
                              <SelectItem value="ORGANIZER">ORGANIZER</SelectItem>
                              <SelectItem value="ADMIN">ADMIN</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(user.id, user.email)}
                          >
                            Reset PWD
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id, user.email)}
                          >
                            Elimina
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                ← Precedente
              </Button>
              <span className="text-sm text-muted-foreground">
                Pagina {page} di {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Successiva →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
