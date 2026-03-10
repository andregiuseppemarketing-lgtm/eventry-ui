'use client';

import Link from 'next/link';
import { NavItem } from '@/types/navigation';
import { isActiveRoute, getBadgeVariant } from '@/lib/navigation-utils';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  item: NavItem;
  currentPath: string;
}

/**
 * Single sidebar navigation item
 * Supports icon, label, badge, and active states
 */
export function SidebarItem({ item, currentPath }: SidebarItemProps) {
  const Icon = item.icon;
  const isActive = isActiveRoute(currentPath, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium',
        'transition-all duration-200',
        isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
      )}
    >
      {/* Icon */}
      {Icon && (
        <Icon 
          className={cn(
            'h-4 w-4 shrink-0',
            isActive && 'animate-pulse'
          )} 
        />
      )}

      {/* Label */}
      <span className="flex-1 truncate">{item.label}</span>

      {/* Badge */}
      {item.badge && (
        <Badge 
          variant={getBadgeVariant(item.badge)}
          className="ml-auto text-xs shrink-0"
        >
          {item.badge}
        </Badge>
      )}
    </Link>
  );
}
