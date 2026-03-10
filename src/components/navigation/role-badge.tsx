import { UserRole } from '@/types/navigation';
import { Badge } from '@/components/ui/badge';
import { formatRoleName, getRoleBadgeVariant } from '@/lib/navigation-utils';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: UserRole;
  compact?: boolean;
  className?: string;
}

/**
 * Display user role badge with appropriate styling
 */
export function RoleBadge({ role, compact = false, className }: RoleBadgeProps) {
  const label = formatRoleName(role);
  const variant = getRoleBadgeVariant(role);

  return (
    <Badge 
      variant={variant}
      className={cn(
        'font-medium',
        compact ? 'text-xs px-2 py-0.5' : 'text-sm',
        className
      )}
    >
      {label}
    </Badge>
  );
}
