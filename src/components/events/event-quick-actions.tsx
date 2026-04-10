'use client';

import { UserRole } from '@/types/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Route } from 'next';
import {
  BarChart3,
  Ticket,
  Wine,
  Gift,
  CheckCircle,
  Users,
} from 'lucide-react';

interface QuickAction {
  label: string;
  href: string;
  icon: React.ElementType;
  variant?: 'default' | 'outline' | 'secondary';
  roles: UserRole[];
}

interface EventQuickActionsProps {
  eventId: string;
  userRole: UserRole;
  layout?: 'dropdown' | 'grid';
}

/**
 * Role-based quick actions per eventi
 * Layout minimale senza complessità eccessiva
 */
export function EventQuickActions({
  eventId,
  userRole,
  layout = 'grid',
}: EventQuickActionsProps) {
  const allActions: QuickAction[] = [
    {
      label: 'Dettagli',
      href: `/eventi/${eventId}`,
      icon: Ticket,
      variant: 'outline',
      roles: ['ADMIN', 'ORGANIZER', 'PR', 'STAFF', 'USER', 'VENUE', 'DJ'],
    },
    {
      label: 'Analytics',
      href: `/analytics/${eventId}`,
      icon: BarChart3,
      variant: 'default',
      roles: ['ADMIN', 'ORGANIZER'],
    },
    {
      label: 'Complimentary',
      href: `/eventi/${eventId}/settings/complimentary`,
      icon: Gift,
      variant: 'outline',
      roles: ['ADMIN', 'ORGANIZER'],
    },
    {
      label: 'Consumazioni',
      href: `/eventi/${eventId}/consumazioni`,
      icon: Wine,
      variant: 'outline',
      roles: ['ADMIN', 'ORGANIZER'],
    },
    {
      label: 'Check-in',
      href: `/checkin?eventId=${eventId}`,
      icon: CheckCircle,
      variant: 'outline',
      roles: ['ADMIN', 'ORGANIZER', 'STAFF'],
    },
    {
      label: 'Guest List',
      href: `/lista?eventId=${eventId}`,
      icon: Users,
      variant: 'outline',
      roles: ['ADMIN', 'ORGANIZER', 'PR'],
    },
  ];

  // PAYMENTS FOUNDATION: Hide checkout when payments disabled
  const paymentsEnabled = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';
  if (paymentsEnabled) {
    allActions.push({
      label: 'Checkout',
      href: `/eventi/${eventId}/checkout`,
      icon: Ticket,
      variant: 'secondary',
      roles: ['USER'],
    });
  }

  // Filtra azioni per ruolo
  const visibleActions = allActions.filter((action) =>
    action.roles.includes(userRole)
  );

  if (visibleActions.length === 0) {
    return null;
  }

  if (layout === 'grid') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {visibleActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              asChild
              variant={action.variant}
              size="sm"
              className="w-full h-11 sm:h-auto"
            >
              <Link href={action.href as Route}>
                <Icon className="h-5 w-5 sm:h-4 sm:w-4 mr-2" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </div>
    );
  }

  // Dropdown layout (semplice lista verticale)
  return (
    <div className="flex flex-col gap-1">
      {visibleActions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.href}
            asChild
            variant="ghost"
            size="sm"
            className="justify-start"
          >
            <Link href={action.href as Route}>
              <Icon className="w-4 h-4 mr-2" />
              {action.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
