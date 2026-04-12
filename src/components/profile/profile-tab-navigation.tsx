'use client';

import { cn } from '@/lib/utils';
import { Calendar, Target, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TabId = 'eventi' | 'attivita' | 'connessioni';

interface ProfileTabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  eventsCount?: number;
}

/**
 * Tab Navigation con stati coming soon per Sprint 1
 * Solo Eventi è attivo, altri tab in stato disabled elegante
 */
export function ProfileTabNavigation({
  activeTab,
  onTabChange,
  eventsCount,
}: ProfileTabNavigationProps) {
  const tabs = [
    {
      id: 'eventi' as TabId,
      label: 'Eventi',
      icon: Calendar,
      count: eventsCount,
      enabled: true,
    },
    {
      id: 'attivita' as TabId,
      label: 'Attività',
      icon: Target,
      enabled: false,
      comingSoon: true,
    },
    {
      id: 'connessioni' as TabId,
      label: 'Connessioni',
      icon: Users,
      enabled: false,
      comingSoon: true,
    },
  ];

  return (
    <div className="border-b border-border">
      <nav className="flex items-center justify-around px-4" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-disabled={!tab.enabled}
              disabled={!tab.enabled}
              onClick={() => tab.enabled && onTabChange(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-all',
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground',
                !tab.enabled && 'opacity-50 cursor-not-allowed',
                tab.enabled && 'hover:text-foreground hover:border-border'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-sm">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="text-xs text-muted-foreground">({tab.count})</span>
              )}
              {tab.comingSoon && (
                <Badge variant="outline" className="text-xs ml-1">
                  Presto
                </Badge>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
