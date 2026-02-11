'use client';

import { useState } from 'react';
import Link from 'next/link';
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
// AlertDialog non disponibile - usa conferma browser standard
import { Trash2, UserCog } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: Date;
}

interface UserManagementProps {
  users: User[];
  totalCount: number;
}

export function UserManagement({ users, totalCount }: UserManagementProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Sei sicuro di voler eliminare l'utente ${email}?\nQuesta azione è irreversibile.`)) {
      return;
    }
    
    setIsDeleting(userId);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione');
      }

      toast.success(`Utente ${email} eliminato con successo`);
      window.location.reload();
    } catch (error) {
      toast.error('Errore durante l\'eliminazione dell\'utente');
    } finally {
      setIsDeleting(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-500';
      case 'ORGANIZER':
        return 'bg-purple-500';
      case 'PR':
        return 'bg-blue-500';
      case 'STAFF':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Mostrando {users.length} di {totalCount} utenti
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/api/admin/users/export">📥 Esporta CSV</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utente</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Ruolo</TableHead>
              <TableHead>Registrato</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName || 'N/A'} {user.lastName || ''}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/admin/users/${user.id}`}
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isDeleting === user.id || user.role === 'ADMIN'}
                      onClick={() => handleDeleteUser(user.id, user.email)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
