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
import { 
  Home, 
  Calendar, 
  QrCode, 
  Settings, 
  LogOut,
  BarChart3,
  Building2,
  Mail,
  Music2,
  User as UserIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = {
  icon: any;
  label: string;
  href: Route;
  roles?: string[];
};

export function MobileNav() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  if (!session?.user) {
    return null;
  }

  const initials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : session.user.email?.[0].toUpperCase() || 'U';

  const navItems: NavItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' as Route },
    { icon: Calendar, label: 'Eventi', href: '/eventi' as Route },
    { icon: QrCode, label: 'Check-in', href: '/checkin' as Route, roles: ['ORGANIZER', 'ADMIN'] },
  ];

  const menuItems: NavItem[] = [
    { icon: BarChart3, label: 'Analytics', href: '/analytics/general' as Route, roles: ['ORGANIZER', 'ADMIN'] },
    { icon: Building2, label: 'I Miei Club', href: '/clubs' as Route, roles: ['ORGANIZER', 'ADMIN'] },
    { icon: Mail, label: 'Marketing', href: '/dashboard/marketing' as Route, roles: ['ADMIN'] },
    { icon: Music2, label: 'DJ Dashboard', href: '/dj/dashboard' as Route, roles: ['DJ'] },
    { icon: Settings, label: 'Impostazioni', href: '/dashboard/settings' as Route },
  ];

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      {/* Bottom Navigation Bar - Solo mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            // Verifica permessi ruolo
            if (item.roles && !item.roles.includes(session.user.role || '')) {
              return null;
            }

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 h-full flex-1 rounded-none',
                  active && 'text-primary'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'animate-pulse')} />
                <span className="text-xs">{item.label}</span>
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
                    {session.user.role && (
                      <p className="text-sm text-primary font-medium mt-1">
                        {session.user.role}
                      </p>
                    )}
                  </div>
                </div>
              </SheetHeader>

              <Separator className="my-6" />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground mb-3">NAVIGAZIONE</p>
                {menuItems.map((item) => {
                  // Verifica permessi ruolo
                  if (item.roles && !item.roles.includes(session.user.role || '')) {
                    return null;
                  }

                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Button
                      key={item.href}
                      variant={active ? 'secondary' : 'ghost'}
                      size="lg"
                      onClick={() => {
                        router.push(item.href);
                        // Chiudi sheet
                        const closeButton = document.querySelector('[data-sheet-close]') as HTMLButtonElement;
                        closeButton?.click();
                      }}
                      className="w-full justify-start"
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.label}
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
