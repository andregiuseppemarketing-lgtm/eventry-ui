/**
 * Mobile Navigation - Bottom Bar con Avatar
 * Visibile solo su mobile, nascosto su desktop
 */

'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import type { Route } from 'next';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserRole, isActiveRoute } from '@/lib/navigation-utils';
import { getMobileNavByRole, getSidebarSectionsByRole, filterEnabledItems } from '@/lib/navigation-config';
import { RoleBadge } from '@/components/navigation/role-badge';
import { useEventContext } from '@/contexts/event-context';
import { preserveEventId } from '@/lib/event-navigation';

// Routes that should preserve eventId during navigation
const EVENT_CENTRIC_ROUTES = [
  '/dashboard',
  '/analytics/general',
  '/checkin',
  '/lista',
  '/situa',
  '/clienti',
];

export function MobileNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedEventId } = useEventContext();

  if (!session?.user) {
    return null;
  }

  const userRole = getUserRole(session);
  
  // Get navigation items from centralized config
  const mobileNavItems = userRole ? filterEnabledItems(getMobileNavByRole(userRole)) : [];
  const sidebarSections = userRole ? getSidebarSectionsByRole(userRole) : [];
  
  // Flatten all sidebar items for sheet menu
  const allMenuItems = sidebarSections.flatMap(section => 
    filterEnabledItems(section.items)
  );

  // Helper to get the correct href with eventId if needed
  const getNavigationHref = (href: string): string => {
    if (EVENT_CENTRIC_ROUTES.includes(href)) {
      return preserveEventId(href, selectedEventId);
    }
    return href;
  };

  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0].toUpperCase() || 'U';

  return (
    <>
      {/* Bottom Navigation Bar - Solo mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.slice(0, 3).map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(getNavigationHref(item.href) as Route)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-full flex-1 rounded-none',
                  active && 'text-primary'
                )}
              >
                {Icon && <Icon className={cn('h-5 w-5', active && 'animate-pulse')} />}
                <span className="text-xs truncate max-w-[60px]">{item.label}</span>
                {item.badge && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
            );
          })}

          {/* Avatar con Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex flex-col items-center justify-center gap-1 h-full flex-1 rounded-none"
              >
                <Avatar className="h-6 w-6 border-2 border-primary/40">
                  <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/40">
                    <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <SheetTitle>{session.user.name || 'Utente'}</SheetTitle>
                    <SheetDescription>{session.user.email}</SheetDescription>
                    {userRole && (
                      <div className="mt-2">
                        <RoleBadge role={userRole} />
                      </div>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <Separator className="my-6" />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground mb-3">NAVIGAZIONE</p>
                {allMenuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActiveRoute(pathname, item.href);

                  return (
                    <Button
                      key={item.href}
                      variant={active ? 'secondary' : 'ghost'}
                      size="lg"
                      onClick={() => {
                        router.push(getNavigationHref(item.href) as Route);
                        // Chiudi sheet
                        const closeButton = document.querySelector('[data-sheet-close]') as HTMLButtonElement;
                        closeButton?.click();
                      }}
                      className="w-full justify-start"
                    >
                      {Icon && <Icon className="mr-3 h-5 w-5" />}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          {item.badge}
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>

              <Separator className="my-6" />

              <Button
                variant="destructive"
                size="lg"
                onClick={() => signOut({ callbackUrl: '/auth/login' as Route })}
                className="w-full"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Logout
              </Button>
            </SheetContent>
          </Sheet>
        </nav>
      </div>

      {/* Spacer per evitare overlap con contenuto - Solo mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
