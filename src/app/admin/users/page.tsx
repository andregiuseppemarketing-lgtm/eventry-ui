/**
 * MILESTONE 7 - ADMIN BACKOFFICE
 * /admin/users - User Management
 * Accesso: Solo ADMIN
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementClient } from '@/components/admin/UserManagementClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);

  // ⚠️ SECURITY: Solo ADMIN
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/unauthorized');
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">👥 User Management</h1>
          <p className="text-muted-foreground mt-1">
            Gestione completa utenti e permessi
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">ADMIN ONLY</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">← Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Client Component with full user management */}
      <UserManagementClient />
    </div>
  );
}
