/**
 * MILESTONE 7 - ADMIN BACKOFFICE
 * /admin/system - System Health
 * Accesso: Solo ADMIN
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { SystemHealthClient } from '@/components/admin/SystemHealthClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminSystemPage() {
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
          <h1 className="text-3xl font-bold">⚙️ System Health</h1>
          <p className="text-muted-foreground mt-1">
            Monitoraggio stato sistema e infrastruttura
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">ADMIN ONLY</Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">← Dashboard</Link>
          </Button>
        </div>
      </div>

      {/* Client Component */}
      <SystemHealthClient />
    </div>
  );
}
