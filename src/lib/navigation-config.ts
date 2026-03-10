import { NavigationConfigMap } from '@/types/navigation';
import {
  LayoutDashboard,
  Shield,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Ticket,
  ClipboardCheck,
  Megaphone,
  UserCheck,
  Building2,
  DollarSign,
  ListChecks,
  Music,
  Radio,
  User,
  Gift,
} from 'lucide-react';

/**
 * Centralized navigation configuration per role.
 * Based on NAVIGATION_AUDIT.md and PAGE_PRIORITIZATION.md
 * 
 * LEGEND:
 * ✅ = Page exists and functional
 * 🚧 = Planned for Milestone 2 (marked as disabled)
 */
export const NAVIGATION_CONFIG: NavigationConfigMap = {
  /**
   * ADMIN - Full platform access
   * Priority pages: /admin, /analytics/general, /dashboard/verifica-identita
   */
  ADMIN: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Admin', href: '/admin', icon: Shield },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
      { label: 'Marketing', href: '/marketing', icon: Megaphone },
    ],
    sidebar: [
      {
        title: 'Generale',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Admin Panel', href: '/admin', icon: Shield },
        ],
      },
      {
        title: 'Gestione Utenti',
        items: [
          { label: 'Verifica Identità', href: '/dashboard/verifica-identita', icon: UserCheck, badge: 'priority' },
          { label: 'Organizzatori', href: '/admin/organizers', icon: Users },
          { label: 'Utenti', href: '/admin/users', icon: User },
        ],
      },
      {
        title: 'Piattaforma',
        items: [
          { label: 'Eventi', href: '/admin/events', icon: Calendar },
          { label: 'Pagamenti', href: '/admin/payments', icon: DollarSign },
          { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        ],
      },
      {
        title: 'Marketing',
        items: [
          { label: 'Campagne', href: '/marketing', icon: Megaphone },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
        ],
      },
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Admin', href: '/admin', icon: Shield },
      { label: 'Verifica', href: '/dashboard/verifica-identita', icon: UserCheck },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
    ],
    quickActions: [
      { label: 'Verifica Identità', href: '/dashboard/verifica-identita', icon: UserCheck, shortcut: '⌘V' },
      { label: 'Admin Panel', href: '/admin', icon: Shield, shortcut: '⌘A' },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ],
  },

  /**
   * ORGANIZER - Event management and operations
   * Priority pages: /clienti, /clubs, /lista, /analytics/general, /eventi
   */
  ORGANIZER: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Eventi', href: '/eventi', icon: Calendar },
      { label: 'Clienti', href: '/clienti', icon: Users },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
      { label: 'Check-in', href: '/checkin', icon: ClipboardCheck },
    ],
    sidebar: [
      {
        title: 'Generale',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        title: 'Eventi',
        items: [
          { label: 'I miei Eventi', href: '/eventi', icon: Calendar },
          { label: 'Crea Evento', href: '/dashboard/crea-evento', icon: Calendar },
          { label: 'Check-in', href: '/checkin', icon: ClipboardCheck },
          { label: 'Situa Live', href: '/situa', icon: Radio },
        ],
      },
      {
        title: 'Gestione',
        items: [
          { label: 'Clienti', href: '/clienti', icon: Users },
          { label: 'Liste', href: '/lista', icon: ListChecks },
          { label: 'Clubs', href: '/clubs', icon: Building2 },
        ],
      },
      {
        title: 'Analytics',
        items: [
          { label: 'Generale', href: '/analytics/general', icon: BarChart3 },
        ],
      },
      {
        title: 'Marketing',
        items: [
          { label: 'Campagne', href: '/marketing', icon: Megaphone },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
        ],
      },
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Eventi', href: '/eventi', icon: Calendar },
      { label: 'Check-in', href: '/checkin', icon: ClipboardCheck },
      { label: 'Clienti', href: '/clienti', icon: Users },
    ],
    quickActions: [
      { label: 'Crea Evento', href: '/dashboard/crea-evento', icon: Calendar, shortcut: '⌘N' },
      { label: 'Check-in', href: '/checkin', icon: ClipboardCheck, shortcut: '⌘K' },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
    ],
  },

  /**
   * PR - Guest list and complimentary ticket management
   * Priority pages: /lista, /pr/omaggi (planned)
   */
  PR: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Omaggi', href: '/pr/omaggi', icon: Gift, disabled: true }, // 🚧 M2
      { label: 'Liste', href: '/lista', icon: ListChecks },
    ],
    sidebar: [
      {
        title: 'PR Area',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Omaggi Disponibili', href: '/pr/omaggi', icon: Gift, disabled: true }, // 🚧 M2
          { label: 'Le mie Liste', href: '/lista', icon: ListChecks },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
        ],
      },
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Omaggi', href: '/pr/omaggi', icon: Gift, disabled: true }, // 🚧 M2
      { label: 'Liste', href: '/lista', icon: ListChecks },
    ],
    quickActions: [
      { label: 'Omaggi Disponibili', href: '/pr/omaggi', icon: Gift },
      { label: 'Le mie Liste', href: '/lista', icon: ListChecks },
    ],
  },

  /**
   * DJ - Performance tracking and event schedule
   * Priority pages: /dj/dashboard
   */
  DJ: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'DJ Dashboard', href: '/dj/dashboard', icon: Music },
    ],
    sidebar: [
      {
        title: 'DJ Area',
        items: [
          { label: 'Dashboard Generale', href: '/dashboard', icon: LayoutDashboard },
          { label: 'DJ Dashboard', href: '/dj/dashboard', icon: Music },
        ],
      },
      {
        title: 'Eventi',
        items: [
          { label: 'Prossimi Eventi', href: '/dj/dashboard', icon: Calendar },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
        ],
      },
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'DJ Hub', href: '/dj/dashboard', icon: Music },
      { label: 'Profilo', href: '/dashboard/profilo', icon: User },
    ],
    quickActions: [
      { label: 'DJ Dashboard', href: '/dj/dashboard', icon: Music },
      { label: 'I miei Eventi', href: '/dj/dashboard', icon: Calendar },
    ],
  },

  /**
   * VENUE - Venue management
   * Note: Limited pages currently exist for this role
   */
  VENUE: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Il mio Locale', href: '/venue/dashboard', icon: Building2, disabled: true }, // 🚧 Future
    ],
    sidebar: [
      {
        title: 'Locale',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Il mio Locale', href: '/venue/dashboard', icon: Building2, disabled: true }, // 🚧 Future
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
        ],
      },
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Locale', href: '/venue/dashboard', icon: Building2, disabled: true }, // 🚧 Future
      { label: 'Profilo', href: '/dashboard/profilo', icon: User },
    ],
    quickActions: [
      { label: 'Il mio Locale', href: '/venue/dashboard', icon: Building2 },
    ],
  },

  /**
   * STAFF - Check-in and door operations
   * Priority pages: /checkin, /situa
   */
  STAFF: {
    navbar: [
      { label: 'Check-in', href: '/checkin', icon: ClipboardCheck },
      { label: 'Situa', href: '/situa', icon: Radio },
    ],
    sidebar: [
      {
        title: 'Operazioni',
        items: [
          { label: 'Check-in', href: '/checkin', icon: ClipboardCheck },
          { label: 'Situa Live', href: '/situa', icon: Radio },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
        ],
      },
    ],
    mobileNav: [
      { label: 'Check-in', href: '/checkin', icon: ClipboardCheck },
      { label: 'Situa', href: '/situa', icon: Radio },
      { label: 'Profilo', href: '/dashboard/profilo', icon: User },
    ],
    quickActions: [
      { label: 'Check-in', href: '/checkin', icon: ClipboardCheck, shortcut: '⌘K' },
      { label: 'Situa Live', href: '/situa', icon: Radio },
    ],
  },

  /**
   * USER - End-user consumer view
   * Priority pages: /biglietti, /feed
   */
  USER: {
    navbar: [
      { label: 'Eventi', href: '/feed', icon: Calendar },
      { label: 'I miei Biglietti', href: '/biglietti', icon: Ticket },
    ],
    sidebar: [
      {
        title: 'Eventi',
        items: [
          { label: 'Scopri Eventi', href: '/feed', icon: Calendar },
        ],
      },
      {
        title: 'I miei Biglietti',
        items: [
          { label: 'Biglietti Attivi', href: '/biglietti', icon: Ticket },
        ],
      },
      {
        title: 'Account',
        items: [
          { label: 'Profilo', href: '/dashboard/profilo', icon: User },
          { label: 'Impostazioni', href: '/dashboard/impostazioni', icon: Settings },
        ],
      },
    ],
    mobileNav: [
      { label: 'Eventi', href: '/feed', icon: Calendar },
      { label: 'Biglietti', href: '/biglietti', icon: Ticket },
      { label: 'Profilo', href: '/dashboard/profilo', icon: User },
    ],
    quickActions: [
      { label: 'I miei Biglietti', href: '/biglietti', icon: Ticket, shortcut: '⌘B' },
      { label: 'Scopri Eventi', href: '/feed', icon: Calendar },
    ],
  },
};

/**
 * Get complete navigation configuration for a role
 */
export function getNavigationByRole(role: string | null | undefined) {
  if (!role) return null;
  return NAVIGATION_CONFIG[role as keyof typeof NAVIGATION_CONFIG] || null;
}

/**
 * Get sidebar sections for a role
 */
export function getSidebarSectionsByRole(role: string | null | undefined) {
  const config = getNavigationByRole(role);
  return config?.sidebar || [];
}

/**
 * Get quick actions for a role
 */
export function getQuickActionsByRole(role: string | null | undefined) {
  const config = getNavigationByRole(role);
  return config?.quickActions || [];
}

/**
 * Get navbar items for a role
 */
export function getNavbarItemsByRole(role: string | null | undefined) {
  const config = getNavigationByRole(role);
  return config?.navbar || [];
}

/**
 * Get mobile navigation items for a role
 */
export function getMobileNavByRole(role: string | null | undefined) {
  const config = getNavigationByRole(role);
  return config?.mobileNav || [];
}

/**
 * Filter out disabled navigation items (for production builds)
 */
export function filterEnabledItems<T extends { disabled?: boolean }>(items: T[]): T[] {
  return items.filter(item => !item.disabled);
}

/**
 * Check if a user has access to a specific route based on role
 */
export function canAccessRoute(route: string, userRole: string | null | undefined): boolean {
  if (!userRole) return false;
  
  const config = getNavigationByRole(userRole);
  if (!config) return false;

  // Check in all navigation sections
  const allItems = [
    ...config.navbar,
    ...config.sidebar.flatMap(section => section.items),
    ...config.mobileNav,
  ];

  return allItems.some(item => route.startsWith(item.href) && !item.disabled);
}
