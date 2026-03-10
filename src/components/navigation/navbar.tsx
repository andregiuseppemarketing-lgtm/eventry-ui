'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUserRole } from '@/lib/navigation-utils';
import { getNavbarItemsByRole, filterEnabledItems } from '@/lib/navigation-config';
import { isActiveRoute } from '@/lib/navigation-utils';
import { UserNav } from '@/components/user-nav';
import { RoleBadge } from './role-badge';
import { cn } from '@/lib/utils';

/**
 * Desktop Navbar - Global navigation header
 * Visible only on desktop/tablet (hidden on mobile)
 */
export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = getUserRole(session);

  // Don't render if no user role
  if (!userRole) return null;

  // Get navbar items for current role
  const navItems = filterEnabledItems(getNavbarItemsByRole(userRole));

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        {/* Logo */}
        <div className="mr-8 hidden md:block">
          <Link href="/dashboard" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EVENTRY
            </span>
          </Link>
        </div>

        {/* Navigation Links - Desktop only */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(pathname, item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 text-sm font-medium transition-colors',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Side - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <RoleBadge role={userRole} />
          <UserNav />
        </div>

        {/* Mobile - Logo + User Nav */}
        <div className="flex md:hidden items-center justify-between flex-1">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              EVENTRY
            </span>
          </Link>
          <div className="flex items-center space-x-2">
            <RoleBadge role={userRole} compact />
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
