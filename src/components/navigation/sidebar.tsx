'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { getUserRole } from '@/lib/navigation-utils';
import { getSidebarSectionsByRole, filterEnabledItems } from '@/lib/navigation-config';
import { SidebarSection } from './sidebar-section';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Sidebar Navigation - Role-based lateral menu
 * Visible only on desktop/tablet, hidden on mobile
 */
export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = getUserRole(session);

  // Don't render if no user role
  if (!userRole) return null;

  // Get sidebar sections for current role
  const sections = getSidebarSectionsByRole(userRole);

  // Filter out disabled items from sections
  const enabledSections = sections.map(section => ({
    ...section,
    items: filterEnabledItems(section.items),
  })).filter(section => section.items.length > 0); // Remove empty sections

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-3">
          {enabledSections.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              currentPath={pathname}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Footer - Optional */}
      <div className="border-t p-4">
        <div className="text-xs text-muted-foreground text-center">
          <p>EVENTRY v1.0</p>
        </div>
      </div>
    </aside>
  );
}
