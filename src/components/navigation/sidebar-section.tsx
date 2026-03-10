'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavSection } from '@/types/navigation';
import { SidebarItem } from './sidebar-item';
import { cn } from '@/lib/utils';

interface SidebarSectionProps {
  section: NavSection;
  currentPath: string;
}

/**
 * Collapsible sidebar section with title and items
 */
export function SidebarSection({ section, currentPath }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(!section.defaultCollapsed);

  // If section is not collapsible, always show open
  const collapsible = section.collapsible !== false;

  return (
    <div className="space-y-1">
      {/* Section Header */}
      {collapsible ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-full items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
        >
          <span className="uppercase tracking-wider">{section.title}</span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-200',
              isOpen ? 'rotate-0' : '-rotate-90'
            )}
          />
        </button>
      ) : (
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {section.title}
        </div>
      )}

      {/* Section Items */}
      {isOpen && (
        <div className="space-y-0.5">
          {section.items.map((item) => (
            <SidebarItem
              key={item.href}
              item={item}
              currentPath={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
}
