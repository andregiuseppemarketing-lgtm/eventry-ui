import { UserRole } from '@/types/navigation';
import type { Session } from 'next-auth';

/**
 * Extract user role from NextAuth session
 */
export function getUserRole(session: Session | null): UserRole | null {
  if (!session?.user) return null;
  // NextAuth session extended with role in auth.ts
  const user = session.user as { role?: UserRole };
  return user.role || null;
}

/**
 * Check if current path matches target route
 * Supports exact match and prefix matching
 */
export function isActiveRoute(
  currentPath: string,
  targetPath: string,
  exact: boolean = false
): boolean {
  if (exact) {
    return currentPath === targetPath;
  }

  // Special case: dashboard should be exact match
  if (targetPath === '/dashboard') {
    return currentPath === '/dashboard';
  }

  // Prefix match for nested routes
  return currentPath.startsWith(targetPath);
}

/**
 * Generate breadcrumb items from pathname
 * Can be overridden with customLabels map
 */
export function generateBreadcrumbs(
  pathname: string,
  customLabels: Record<string, string> = {}
) {
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Use custom label if provided
    if (customLabels[href]) {
      return { label: customLabels[href], href };
    }

    // Try to prettify segment
    const label = segment
      .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    return { label, href };
  });

  return breadcrumbs;
}

/**
 * Check if navigation item should be visible based on role
 */
export function isItemVisible(
  item: { roles?: UserRole[]; requiresAuth?: boolean },
  userRole: UserRole | null
): boolean {
  // If requires auth but no user, hide
  if (item.requiresAuth && !userRole) {
    return false;
  }

  // If no role restrictions, show
  if (!item.roles || item.roles.length === 0) {
    return true;
  }

  // Check if user role is in allowed roles
  return userRole ? item.roles.includes(userRole) : false;
}

/**
 * Get badge variant based on badge content
 */
export function getBadgeVariant(badge: string | number | undefined): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (typeof badge === 'number' && badge > 0) {
    return 'destructive'; // For counts/notifications
  }

  if (typeof badge === 'string') {
    const lowerBadge = badge.toLowerCase();
    if (lowerBadge.includes('new') || lowerBadge.includes('priority')) {
      return 'destructive';
    }
    if (lowerBadge.includes('beta') || lowerBadge.includes('soon')) {
      return 'secondary';
    }
  }

  return 'default';
}

/**
 * Format role name for display
 */
export function formatRoleName(role: UserRole): string {
  const roleLabels: Record<UserRole, string> = {
    ADMIN: 'Admin',
    ORGANIZER: 'Organizzatore',
    PR: 'PR',
    DJ: 'DJ',
    VENUE: 'Locale',
    STAFF: 'Staff',
    USER: 'Utente',
  };

  return roleLabels[role] || role;
}

/**
 * Get role badge color/variant
 */
export function getRoleBadgeVariant(role: UserRole): 'default' | 'destructive' | 'secondary' | 'outline' {
  const variantMap: Record<UserRole, 'default' | 'destructive' | 'secondary' | 'outline'> = {
    ADMIN: 'destructive',
    ORGANIZER: 'default',
    PR: 'secondary',
    DJ: 'secondary',
    VENUE: 'secondary',
    STAFF: 'outline',
    USER: 'outline',
  };

  return variantMap[role] || 'outline';
}

/**
 * Check if route is a public route (no auth required)
 */
export function isPublicRoute(pathname: string): boolean {
  const publicRoutes = [
    '/auth/signin',
    '/auth/signup',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
    '/gdpr',
  ];

  return publicRoutes.some(route => pathname.startsWith(route));
}

/**
 * Get icon size class based on context
 */
export function getIconSize(context: 'navbar' | 'sidebar' | 'mobile' | 'dropdown'): string {
  const sizes = {
    navbar: 'h-4 w-4',
    sidebar: 'h-4 w-4',
    mobile: 'h-5 w-5',
    dropdown: 'h-4 w-4',
  };

  return sizes[context];
}
