import { LucideIcon } from 'lucide-react';

/**
 * User role types matching Prisma schema
 */
export type UserRole = 
  | 'ADMIN' 
  | 'ORGANIZER' 
  | 'PR' 
  | 'DJ' 
  | 'VENUE' 
  | 'STAFF' 
  | 'USER';

/**
 * Navigation item for menus, navbar, sidebar
 */
export interface NavItem {
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Optional Lucide icon */
  icon?: LucideIcon;
  /** Optional badge (text or number, e.g. "New", 5) */
  badge?: string | number;
  /** Requires authentication */
  requiresAuth?: boolean;
  /** Allowed roles (empty = all authenticated users) */
  roles?: UserRole[];
  /** Nested items (dropdown/submenu) */
  children?: NavItem[];
  /** Mark as coming soon / not yet implemented */
  disabled?: boolean;
  /** External link opens in new tab */
  external?: boolean;
}

/**
 * Sidebar section with title and grouped items
 */
export interface NavSection {
  /** Section title */
  title: string;
  /** Navigation items in this section */
  items: NavItem[];
  /** Collapsible section (default: true) */
  collapsible?: boolean;
  /** Initially collapsed (default: false) */
  defaultCollapsed?: boolean;
}

/**
 * Quick action for user menu dropdown
 */
export interface QuickAction {
  /** Action label */
  label: string;
  /** Action route */
  href: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Keyboard shortcut hint */
  shortcut?: string;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Current/active item */
  current?: boolean;
}

/**
 * Complete navigation configuration for a role
 */
export interface NavigationConfig {
  /** Top navbar items (desktop) */
  navbar: NavItem[];
  /** Sidebar sections (desktop/tablet) */
  sidebar: NavSection[];
  /** Bottom mobile navigation items */
  mobileNav: NavItem[];
  /** Quick actions in user menu */
  quickActions: QuickAction[];
}

/**
 * Map of all role configurations
 */
export type NavigationConfigMap = {
  [K in UserRole]: NavigationConfig;
};

/**
 * Navigation context passed to components
 */
export interface NavigationContext {
  currentPath: string;
  userRole: UserRole | null;
  config: NavigationConfig | null;
}
