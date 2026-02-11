'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Edit } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: Date;
  status: string;
  createdAt: Date;
  creator: {
    firstName: string | null;
    lastName: string | null;
  };
}

interface EventManagementProps {
  events: Event[];
  totalCount: number;
}

export function EventManagement({ events, totalCount }: EventManagementProps) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-500';
      case 'DRAFT':
        return 'bg-yellow-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Mostrando {events.length} di {totalCount} eventi
        </p>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Titolo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Creatore</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.title}</TableCell>
                <TableCell>
                  {new Date(event.date).toLocaleDateString('it-IT')}
                </TableCell>
                <TableCell>
                  {event.creator.firstName} {event.creator.lastName}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeColor(event.status)}>
                    {event.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/events/${event.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/dashboard/events/${event.id}/edit`}
                    >
                      <Edit className="h-4 w-4" />
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
