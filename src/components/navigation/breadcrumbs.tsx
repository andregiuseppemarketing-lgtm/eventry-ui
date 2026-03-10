'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbs } from '@/lib/navigation-utils';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  /**
   * Custom labels for specific paths
   * Example: { '/admin': 'Admin Panel', '/clienti/abc': 'Mario Rossi' }
   */
  customLabels?: Record<string, string>;
  /**
   * Show home icon as first item (default: true)
   */
  showHome?: boolean;
  /**
   * Custom home path (default: '/dashboard')
   */
  homePath?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Breadcrumbs Navigation Component
 * 
 * Automatically generates breadcrumbs from current pathname.
 * Supports custom labels for specific paths to avoid ugly IDs or slugs.
 * 
 * Usage:
 * ```tsx
 * <Breadcrumbs 
 *   customLabels={{ 
 *     '/admin': 'Admin Panel',
 *     '/clienti/abc123': 'Mario Rossi'
 *   }} 
 * />
 * ```
 */
export function Breadcrumbs({
  customLabels = {},
  showHome = true,
  homePath = '/dashboard',
  className,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  // Don't render breadcrumbs on root/home paths
  if (!pathname || pathname === '/' || pathname === homePath) {
    return null;
  }

  // Generate breadcrumb items
  const breadcrumbs = generateBreadcrumbs(pathname, customLabels);

  // If only one level and it's home, don't render
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground mb-6', className)}
    >
      {/* Home/Dashboard Link */}
      {showHome && (
        <>
          <Link 
            href={homePath}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
          {breadcrumbs.length > 0 && (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
        </>
      )}

      {/* Breadcrumb Items */}
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={crumb.href} className="flex items-center space-x-1">
            {isLast ? (
              <span className="font-medium text-foreground truncate max-w-[200px] md:max-w-none">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link
                  href={crumb.href}
                  className="hover:text-foreground transition-colors truncate max-w-[150px] md:max-w-none"
                >
                  {crumb.label}
                </Link>
                <ChevronRight className="h-4 w-4 shrink-0" />
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
