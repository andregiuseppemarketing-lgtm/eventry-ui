# 🔧 EVENTRY - Technical Patch Plan

**Data:** 9 marzo 2026  
**Planning by:** Frontend Tech Lead + DevOps

---

## TASK 4 — TECHNICAL PATCH PLAN (File-by-File)

### 📋 OBIETTIVO

Piano tecnico dettagliato file-by-file per implementare Milestone 1 & 2, con:
- Exact file paths
- Modifiche specifiche per ogni file
- Import statements
- Code snippets critici
- Dependencies tra file

---

## 🗂️ NEW FILE STRUCTURE

### Directory da Creare:

```bash
mkdir -p src/components/navigation
mkdir -p src/types
mkdir -p src/app/eventi/[id]/settings
mkdir -p src/app/pr/{omaggi,eventi}
mkdir -p src/app/liste/[listId]
mkdir -p src/app/api/search
```

---

## 📝 MILESTONE 1 - FILE-BY-FILE PATCHES

---

### **[M1.1] CREATE: `src/types/navigation.ts`**

**Purpose:** Type definitions per navigation system

```typescript
import { LucideIcon } from 'lucide-react';

export type UserRole = 
  | 'ADMIN' 
  | 'ORGANIZER' 
  | 'PR' 
  | 'DJ' 
  | 'VENUE' 
  | 'STAFF' 
  | 'USER';

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  requiresAuth?: boolean;
  roles?: UserRole[];
  children?: NavItem[];
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavigationConfig {
  navbar: NavItem[];
  sidebar: NavSection[];
  mobileNav: NavItem[];
  userMenu: NavItem[];
}

export type NavigationConfigMap = {
  [K in UserRole]: NavigationConfig;
};
```

**Dependencies:** None  
**Used by:** All navigation components

---

### **[M1.2] CREATE: `src/lib/navigation-config.ts`**

**Purpose:** Centralized navigation configuration per role

```typescript
import { NavigationConfigMap } from '@/types/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Shield,
  Ticket,
  // ... altri icon imports
} from 'lucide-react';

export const NAVIGATION_CONFIG: NavigationConfigMap = {
  ADMIN: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Admin', href: '/admin', icon: Shield },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
      { label: 'Marketing', href: '/marketing', icon: Users },
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
          { label: 'Verifica Identità', href: '/dashboard/verifica-identita', icon: Shield },
          { label: 'Utenti', href: '/admin/users', icon: Users },
          { label: 'Organizzatori', href: '/admin/organizers', icon: Users },
        ],
      },
      // ... altre sezioni ADMIN
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Admin', href: '/admin', icon: Shield },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
    ],
    userMenu: [
      { label: 'Impostazioni', href: '/dashboard/impostazioni' },
      { label: 'Profilo', href: '/dashboard/profilo' },
    ],
  },

  ORGANIZER: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Eventi', href: '/eventi', icon: Calendar },
      { label: 'Clienti', href: '/clienti', icon: Users },
      { label: 'Analytics', href: '/analytics/general', icon: BarChart3 },
    ],
    sidebar: [
      {
        title: 'Eventi',
        items: [
          { label: 'I miei Eventi', href: '/eventi', icon: Calendar },
          { label: 'Crea Evento', href: '/dashboard/crea-evento', icon: Calendar },
          { label: 'Check-in', href: '/checkin', icon: Ticket },
        ],
      },
      {
        title: 'Gestione Clienti',
        items: [
          { label: 'Clienti', href: '/clienti', icon: Users },
          { label: 'Liste', href: '/lista', icon: Users },
          { label: 'Clubs', href: '/clubs', icon: Users },
        ],
      },
      // ... altre sezioni ORGANIZER
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Eventi', href: '/eventi', icon: Calendar },
      { label: 'Check-in', href: '/checkin', icon: Ticket },
    ],
    userMenu: [
      { label: 'Il mio Profilo', href: '/dashboard/profilo' },
      { label: 'Impostazioni', href: '/dashboard/impostazioni' },
    ],
  },

  PR: {
    navbar: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Omaggi', href: '/pr/omaggi', icon: Ticket },
      { label: 'Liste', href: '/lista', icon: Users },
    ],
    sidebar: [
      {
        title: 'PR Area',
        items: [
          { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
          { label: 'Omaggi Disponibili', href: '/pr/omaggi', icon: Ticket },
          { label: 'Le mie Liste', href: '/lista', icon: Users },
        ],
      },
      // ... altre sezioni PR
    ],
    mobileNav: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Omaggi', href: '/pr/omaggi', icon: Ticket },
      { label: 'Liste', href: '/lista', icon: Users },
    ],
    userMenu: [
      { label: 'Profilo', href: '/dashboard/profilo' },
    ],
  },

  // ... DJ, VENUE, STAFF, USER configs
  // (truncated per brevity - implementare tutti e 7)
};
```

**Dependencies:** `types/navigation.ts`, `lucide-react`  
**Used by:** `components/navigation/*`

---

### **[M1.3] CREATE: `src/lib/navigation-utils.ts`**

**Purpose:** Utility functions per navigation logic

```typescript
import { UserRole } from '@/types/navigation';
import { Session } from 'next-auth';

export function getUserRole(session: Session | null): UserRole | null {
  if (!session?.user) return null;
  return (session.user as any).role as UserRole;
}

export function canAccessRoute(
  route: string,
  userRole: UserRole | null
): boolean {
  if (!userRole) return false;

  const routePermissions: Record<string, UserRole[]> = {
    '/admin': ['ADMIN'],
    '/analytics': ['ADMIN', 'ORGANIZER'],
    '/eventi': ['ADMIN', 'ORGANIZER'],
    '/pr': ['ADMIN', 'ORGANIZER', 'PR'],
    '/checkin': ['ADMIN', 'ORGANIZER', 'STAFF'],
    // ... altre route
  };

  const allowedRoles = routePermissions[route] || [];
  return allowedRoles.includes(userRole);
}

export function isActiveRoute(
  currentPath: string,
  targetPath: string
): boolean {
  if (targetPath === '/dashboard') {
    return currentPath === '/dashboard';
  }
  return currentPath.startsWith(targetPath);
}

export function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return { label, href };
  });
}
```

**Dependencies:** `types/navigation.ts`, `next-auth`  
**Used by:** All navigation components

---

### **[M1.4] CREATE: `src/components/navigation/navbar.tsx`**

**Purpose:** Desktop global navbar

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUserRole } from '@/lib/navigation-utils';
import { NAVIGATION_CONFIG } from '@/lib/navigation-config';
import { SearchBar } from './search-bar';
import { UserNav } from '../user-nav';
import { RoleBadge } from './role-badge';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = getUserRole(session);

  if (!userRole) return null;

  const navConfig = NAVIGATION_CONFIG[userRole];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <div className="mr-8">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">EVENTRY</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          {navConfig.navbar.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center space-x-2 text-sm font-medium transition-colors
                  ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
                `}
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

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <SearchBar />
          <RoleBadge role={userRole} />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
```

**Dependencies:** 
- `lib/navigation-config.ts`
- `lib/navigation-utils.ts`
- `components/user-nav.tsx`
- `components/navigation/search-bar.tsx`
- `components/navigation/role-badge.tsx`

**Used in:** `app/layout.tsx`

---

### **[M1.5] CREATE: `src/components/navigation/sidebar.tsx`**

**Purpose:** Role-based sidebar navigation

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { getUserRole, isActiveRoute } from '@/lib/navigation-utils';
import { NAVIGATION_CONFIG } from '@/lib/navigation-config';
import { SidebarSection } from './sidebar-section';
import { ScrollArea } from '@/components/ui/scroll-area';

export function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const userRole = getUserRole(session);

  if (!userRole) return null;

  const navConfig = NAVIGATION_CONFIG[userRole];

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-3">
          {navConfig.sidebar.map((section) => (
            <SidebarSection
              key={section.title}
              section={section}
              currentPath={pathname}
            />
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
```

**Dependencies:**
- `lib/navigation-config.ts`
- `lib/navigation-utils.ts`
- `components/navigation/sidebar-section.tsx`
- `components/ui/scroll-area.tsx`

**Used in:** `app/dashboard/layout.tsx`, `app/admin/layout.tsx`

---

### **[M1.6] CREATE: `src/components/navigation/sidebar-section.tsx`**

**Purpose:** Collapsible sidebar section

```typescript
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NavSection } from '@/types/navigation';
import { SidebarItem } from './sidebar-item';

interface SidebarSectionProps {
  section: NavSection;
  currentPath: string;
}

export function SidebarSection({ section, currentPath }: SidebarSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-2 py-1 text-sm font-semibold text-foreground hover:bg-accent rounded-md"
      >
        <span>{section.title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 space-y-1">
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
```

**Dependencies:**
- `types/navigation.ts`
- `components/navigation/sidebar-item.tsx`

**Used in:** `components/navigation/sidebar.tsx`

---

### **[M1.7] CREATE: `src/components/navigation/sidebar-item.tsx`**

**Purpose:** Single sidebar navigation item

```typescript
'use client';

import Link from 'next/link';
import { NavItem } from '@/types/navigation';
import { isActiveRoute } from '@/lib/navigation-utils';

interface SidebarItemProps {
  item: NavItem;
  currentPath: string;
}

export function SidebarItem({ item, currentPath }: SidebarItemProps) {
  const Icon = item.icon;
  const isActive = isActiveRoute(currentPath, item.href);

  return (
    <Link
      href={item.href}
      className={`
        flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium
        transition-colors
        ${
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }
      `}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
```

**Dependencies:**
- `types/navigation.ts`
- `lib/navigation-utils.ts`

**Used in:** `components/navigation/sidebar-section.tsx`

---

### **[M1.8] CREATE: `src/components/navigation/breadcrumbs.tsx`**

**Purpose:** Breadcrumb navigation

```typescript
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { generateBreadcrumbs } from '@/lib/navigation-utils';

interface BreadcrumbsProps {
  customLabels?: Record<string, string>;
}

export function Breadcrumbs({ customLabels = {} }: BreadcrumbsProps) {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        Dashboard
      </Link>
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const label = customLabels[crumb.href] || crumb.label;

        return (
          <div key={crumb.href} className="flex items-center space-x-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground font-medium">{label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

**Dependencies:**
- `lib/navigation-utils.ts`
- `lucide-react`

**Used in:** Multiple pages

---

### **[M1.9] CREATE: `src/components/navigation/search-bar.tsx`**

**Purpose:** Global search bar (UI-only in M1, functionality in M2)

```typescript
'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SearchResults } from './search-results';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cerca eventi, clienti..."
            className="w-64 pl-8"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <SearchResults query={query} />
      </PopoverContent>
    </Popover>
  );
}
```

**Dependencies:**
- `components/ui/input.tsx`
- `components/ui/popover.tsx`
- `components/navigation/search-results.tsx`

**Used in:** `components/navigation/navbar.tsx`

---

### **[M1.10] CREATE: `src/components/navigation/search-results.tsx`**

**Purpose:** Search results dropdown (mock data in M1)

```typescript
'use client';

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  if (!query) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Inizia a digitare per cercare...
      </div>
    );
  }

  // Mock results - will be replaced with API call in M2
  const mockResults = [
    { type: 'event', label: 'Summer Party 2026', href: '/eventi/1' },
    { type: 'client', label: 'Mario Rossi', href: '/clienti/1' },
  ];

  return (
    <div className="max-h-80 overflow-y-auto">
      {mockResults.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Nessun risultato trovato per &quot;{query}&quot;
        </div>
      ) : (
        <div className="py-2">
          {mockResults.map((result) => (
            <a
              key={result.href}
              href={result.href}
              className="block px-4 py-2 text-sm hover:bg-accent"
            >
              <div className="font-medium">{result.label}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {result.type}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Dependencies:** None (standalone)  
**Used in:** `components/navigation/search-bar.tsx`

---

### **[M1.11] CREATE: `src/components/navigation/role-badge.tsx`**

**Purpose:** Display user role badge

```typescript
import { UserRole } from '@/types/navigation';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Admin',
  ORGANIZER: 'Organizzatore',
  PR: 'PR',
  DJ: 'DJ',
  VENUE: 'Locale',
  STAFF: 'Staff',
  USER: 'Utente',
};

const ROLE_VARIANTS: Record<UserRole, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ADMIN: 'destructive',
  ORGANIZER: 'default',
  PR: 'secondary',
  DJ: 'secondary',
  VENUE: 'secondary',
  STAFF: 'outline',
  USER: 'outline',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <Badge variant={ROLE_VARIANTS[role]}>
      {ROLE_LABELS[role]}
    </Badge>
  );
}
```

**Dependencies:**
- `types/navigation.ts`
- `components/ui/badge.tsx`

**Used in:** `components/navigation/navbar.tsx`

---

### **[M1.12] MODIFY: `src/components/user-nav.tsx`**

**Changes:** Extend menu with role-based quick actions

```typescript
// ADD after imports:
import { getUserRole } from '@/lib/navigation-utils';
import { NAVIGATION_CONFIG } from '@/lib/navigation-config';

// REPLACE DropdownMenuContent section:
<DropdownMenuContent className="w-56" align="end" forceMount>
  <DropdownMenuLabel className="font-normal">
    <div className="flex flex-col space-y-1">
      <p className="text-sm font-medium leading-none">{session.user.name}</p>
      <p className="text-xs leading-none text-muted-foreground">
        {session.user.email}
      </p>
    </div>
  </DropdownMenuLabel>
  <DropdownMenuSeparator />

  {/* AGGIUNGI Quick Actions */}
  <DropdownMenuGroup>
    {userRole && NAVIGATION_CONFIG[userRole]?.userMenu.map((item) => (
      <DropdownMenuItem key={item.href} asChild>
        <Link href={item.href}>{item.label}</Link>
      </DropdownMenuItem>
    ))}
  </DropdownMenuGroup>
  <DropdownMenuSeparator />

  {/* Existing items */}
  <DropdownMenuItem asChild>
    <Link href="/dashboard/impostazioni">Impostazioni</Link>
  </DropdownMenuItem>
  <DropdownMenuItem onClick={() => signOut()}>
    Esci
  </DropdownMenuItem>
</DropdownMenuContent>
```

**File:** `src/components/user-nav.tsx`  
**Dependencies:** Add `lib/navigation-config.ts`, `lib/navigation-utils.ts`

---

### **[M1.13] MODIFY: `src/components/mobile-nav.tsx`**

**Changes:** Make role-based dynamic

```typescript
// ADD after existing imports:
import { getUserRole } from '@/lib/navigation-utils';
import { NAVIGATION_CONFIG } from '@/lib/navigation-config';

// REPLACE navItems const with:
const userRole = getUserRole(session);
const navItems = userRole ? NAVIGATION_CONFIG[userRole].mobileNav : [];

// Keep existing render logic
```

**File:** `src/components/mobile-nav.tsx`  
**Dependencies:** Add `lib/navigation-config.ts`, `lib/navigation-utils.ts`

---

### **[M1.14] MODIFY: `src/app/layout.tsx`**

**Changes:** Add Navbar component

```typescript
// ADD import:
import { Navbar } from '@/components/navigation/navbar';

// ADD after <body> tag, before {children}:
<Navbar />
{children}
```

**File:** `src/app/layout.tsx`  
**Dependencies:** `components/navigation/navbar.tsx`

---

### **[M1.15] CREATE: `src/app/dashboard/layout.tsx`**

**Purpose:** Dashboard layout with sidebar

```typescript
import { Sidebar } from '@/components/navigation/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

**File:** `src/app/dashboard/layout.tsx` (NEW)  
**Dependencies:** `components/navigation/sidebar.tsx`

---

### **[M1.16] CREATE: `src/app/admin/layout.tsx`**

**Purpose:** Admin layout with sidebar

```typescript
import { Sidebar } from '@/components/navigation/sidebar';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container py-6">
          <Breadcrumbs customLabels={{ '/admin': 'Admin Panel' }} />
          {children}
        </div>
      </main>
    </div>
  );
}
```

**File:** `src/app/admin/layout.tsx` (NEW)  
**Dependencies:** `components/navigation/sidebar.tsx`, `components/navigation/breadcrumbs.tsx`

---

## MILESTONE 1 FILES SUMMARY

| Action | Count | Files |
|--------|-------|-------|
| CREATE | 15 | Types, utils, navigation components, layouts |
| MODIFY | 3 | user-nav, mobile-nav, root layout |
| **TOTAL** | **18** | |

---

## 📝 MILESTONE 2 - FILE-BY-FILE PATCHES

---

### **[M2.1] CREATE: `src/app/eventi/page.tsx`**

**Purpose:** Eventi list hub for ORGANIZER

```typescript
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default async function EventiPage() {
  const session = await requireAuth(['ORGANIZER', 'ADMIN']);

  const eventi = await prisma.event.findMany({
    where: {
      organizerId: session.user.id,
    },
    orderBy: {
      date: 'desc',
    },
  });

  return (
    <div>
      <Breadcrumbs />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">I miei Eventi</h1>
        <Button asChild>
          <Link href="/dashboard/crea-evento">
            <Plus className="mr-2 h-4 w-4" />
            Crea Evento
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventi.map((evento) => (
          <Link
            key={evento.id}
            href={`/eventi/${evento.id}`}
            className="block p-6 border rounded-lg hover:shadow-md transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{evento.name}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(evento.date).toLocaleDateString('it-IT')}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**File:** `src/app/eventi/page.tsx` (NEW)  
**Dependencies:** `lib/auth.ts`, `lib/prisma.ts`, `components/navigation/breadcrumbs.tsx`

---

### **[M2.2] CREATE: `src/app/eventi/[id]/page.tsx`**

**Purpose:** Event detail hub with tabs/cards

```typescript
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth(['ORGANIZER', 'ADMIN']);

  const evento = await prisma.event.findUnique({
    where: { id: params.id },
  });

  if (!evento) notFound();

  return (
    <div>
      <Breadcrumbs customLabels={{ [`/eventi/${params.id}`]: evento.name }} />

      <h1 className="text-3xl font-bold mb-6">{evento.name}</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="guests">Ospiti</TabsTrigger>
          <TabsTrigger value="settings">Impostazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Event stats cards */}
        </TabsContent>

        <TabsContent value="guests">
          {/* Guest list */}
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-2 gap-4">
            <Link
              href={`/eventi/${params.id}/settings/general`}
              className="p-4 border rounded-lg hover:shadow-md"
            >
              Impostazioni Generali
            </Link>
            <Link
              href={`/eventi/${params.id}/settings/complimentary`}
              className="p-4 border rounded-lg hover:shadow-md"
            >
              Quote Omaggi
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**File:** `src/app/eventi/[id]/page.tsx` (NEW)  
**Dependencies:** `lib/auth.ts`, `lib/prisma.ts`, `components/navigation/breadcrumbs.tsx`

---

### **[M2.3] MODIFY: `src/app/eventi/[id]/settings/complimentary/page.tsx`**

**Changes:** Add breadcrumbs and back link

```typescript
// ADD after imports:
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// ADD at top of component return:
<Breadcrumbs customLabels={{
  [`/eventi/${eventId}`]: evento.name,
  [`/eventi/${eventId}/settings/complimentary`]: 'Quote Omaggi',
}} />

<Link
  href={`/eventi/${eventId}`}
  className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
>
  <ChevronLeft className="mr-1 h-4 w-4" />
  Torna all&apos;evento
</Link>

{/* Existing content */}
```

**File:** `src/app/eventi/[id]/settings/complimentary/page.tsx`  
**Dependencies:** Add `components/navigation/breadcrumbs.tsx`

---

### **[M2.4] CREATE: `src/app/pr/omaggi/page.tsx`**

**Purpose:** PR view of available complementary quotas

```typescript
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';

export default async function PROmaggiPage() {
  const session = await requireAuth(['PR', 'ORGANIZER', 'ADMIN']);

  const quotas = await prisma.eventQuota.findMany({
    where: {
      prId: session.user.id,
      remaining: { gt: 0 },
    },
    include: {
      event: true,
    },
  });

  return (
    <div>
      <Breadcrumbs />
      <h1 className="text-3xl font-bold mb-6">Omaggi Disponibili</h1>

      <div className="grid grid-cols-1 gap-4">
        {quotas.map((quota) => (
          <div key={quota.id} className="border rounded-lg p-6">
            <h3 className="text-xl font-semibold">{quota.event.name}</h3>
            <p className="text-muted-foreground">
              Disponibili: {quota.remaining}/{quota.quantity}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**File:** `src/app/pr/omaggi/page.tsx` (NEW)  
**Dependencies:** `lib/auth.ts`, `lib/prisma.ts`, `components/navigation/breadcrumbs.tsx`

---

### **[M2.5] MODIFY: `src/app/dashboard/page.tsx`**

**Changes:** Add link cards to sections

```typescript
// ADD import:
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

// MODIFY stats cards to be clickable:
<Link href="/eventi" className="block">
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Eventi Totali</CardTitle>
      <Calendar className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{stats.totalEvents}</div>
      <p className="text-xs text-muted-foreground flex items-center mt-2">
        Vedi tutti <ArrowRight className="ml-1 h-3 w-3" />
      </p>
    </CardContent>
  </Card>
</Link>

// Repeat for other cards: /clienti, /analytics/general, /admin
```

**File:** `src/app/dashboard/page.tsx`  
**Dependencies:** None (only add `next/link`)

---

### **[M2.6] MODIFY: Multiple Admin Pages**

**Changes:** Add breadcrumbs to all admin pages

**Files to modify:**
- `src/app/admin/page.tsx`
- `src/app/admin/organizers/page.tsx`
- `src/app/admin/events/page.tsx`
- `src/app/admin/users/page.tsx`
- `src/app/admin/payments/page.tsx`
- `src/app/admin/analytics/page.tsx`

**For each file, ADD:**

```typescript
// ADD import:
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';

// ADD at top of return:
<Breadcrumbs customLabels={{
  '/admin': 'Admin Panel',
  '/admin/organizers': 'Gestione Organizzatori',
  // ... etc based on page
}} />
```

---

### **[M2.7] MODIFY: `src/app/lista/page.tsx`**

**Changes:** Add breadcrumbs and link to detail pages

```typescript
// ADD imports:
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';
import Link from 'next/link';

// ADD at top of return:
<Breadcrumbs />

// MODIFY list items to be links:
{lists.map((list) => (
  <Link
    key={list.id}
    href={`/liste/${list.id}`}
    className="block p-4 border rounded-lg hover:shadow-md transition-shadow"
  >
    {/* Existing list content */}
  </Link>
))}
```

**File:** `src/app/lista/page.tsx`  
**Dependencies:** Add `components/navigation/breadcrumbs.tsx`

---

### **[M2.8] MODIFY: `src/app/clienti/page.tsx`**

**Changes:** Add breadcrumbs

```typescript
// ADD import:
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';

// ADD at top of return:
<Breadcrumbs />
```

**File:** `src/app/clienti/page.tsx`  
**Dependencies:** Add `components/navigation/breadcrumbs.tsx`

---

### **[M2.9] MODIFY: `src/app/clubs/page.tsx`**

**Changes:** Add breadcrumbs

```typescript
// ADD import:
import { Breadcrumbs } from '@/components/navigation/breadcrumbs';

// ADD at top of return:
<Breadcrumbs />
```

**File:** `src/app/clubs/page.tsx`  
**Dependencies:** Add `components/navigation/breadcrumbs.tsx`

---

### **[M2.10] CREATE: `src/app/api/search/route.ts`**

**Purpose:** Global search API endpoint

```typescript
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    if (query.length < 2) {
      return NextResponse.json({ events: [], clients: [], venues: [] });
    }

    const [events, clients, venues] = await Promise.all([
      prisma.event.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          organizerId: session.user.id,
        },
        take: 5,
        select: { id: true, name: true, date: true },
      }),

      prisma.client.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
          userId: session.user.id,
        },
        take: 5,
        select: { id: true, name: true, email: true },
      }),

      prisma.venue.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
        select: { id: true, name: true, city: true },
      }),
    ]);

    return NextResponse.json({ events, clients, venues });
  } catch (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

**File:** `src/app/api/search/route.ts` (NEW)  
**Dependencies:** `lib/auth.ts`, `lib/prisma.ts`

---

### **[M2.11] MODIFY: `src/components/navigation/search-results.tsx`**

**Changes:** Implement real search API call

```typescript
// ADD imports:
import { useEffect, useState } from 'react';

// REPLACE component with:
export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!query) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Inizia a digitare per cercare...
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-sm">Ricerca in corso...</div>;
  }

  if (!results) return null;

  const hasResults = 
    results.events?.length > 0 || 
    results.clients?.length > 0 || 
    results.venues?.length > 0;

  if (!hasResults) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Nessun risultato trovato per &quot;{query}&quot;
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto py-2">
      {results.events?.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-1 text-xs font-semibold text-muted-foreground">
            Eventi
          </div>
          {results.events.map((event: any) => (
            <a
              key={event.id}
              href={`/eventi/${event.id}`}
              className="block px-4 py-2 hover:bg-accent"
            >
              <div className="text-sm font-medium">{event.name}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(event.date).toLocaleDateString('it-IT')}
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Repeat for clients and venues */}
    </div>
  );
}
```

**File:** `src/components/navigation/search-results.tsx`  
**Dependencies:** React hooks, `/api/search` endpoint

---

### **[M2.12] MODIFY: `src/middleware.ts`**

**Changes:** Add legacy redirects

```typescript
// ADD after existing middleware logic:

// Legacy redirects
const redirects: Record<string, string> = {
  '/user/profilo': '/dashboard/profilo',
  '/dashboard/admin': '/admin',
};

if (redirects[pathname]) {
  return NextResponse.redirect(new URL(redirects[pathname], request.url));
}
```

**File:** `src/middleware.ts`  
**Dependencies:** None

---

## MILESTONE 2 FILES SUMMARY

| Action | Count | Files |
|--------|-------|-------|
| CREATE | 4 | Eventi hub pages, PR pages, API search |
| MODIFY | 15+ | Add breadcrumbs, links, search functionality |
| **TOTAL** | **19+** | |

---

## 🔄 IMPLEMENTATION ORDER

### Week 1: Milestone 1 Foundation
**Day 1:**
- M1.1 → M1.3: Types & utils
- M1.4 → M1.7: Core navigation components

**Day 2:**
- M1.8 → M1.11: Breadcrumbs, search, role badge
- M1.12 → M1.13: Enhance existing components

**Day 3:**
- M1.14 → M1.16: Layout integration
- Visual testing all roles

**Day 4:**
- Polish, accessibility, responsive testing
- Bug fixes

### Week 2: Milestone 2 Connections
**Day 1:**
- M2.1 → M2.3: Eventi hub pages
- M2.5: Dashboard links

**Day 2:**
- M2.4: PR pages
- M2.6: Admin breadcrumbs
- M2.12: Redirects

**Day 3:**
- M2.7 → M2.9: Add breadcrumbs to other sections
- M2.10 → M2.11: Search functionality
- Full testing

---

## ✅ VALIDATION CHECKLIST

### After M1:
- [ ] All roles see correct navbar items
- [ ] Sidebar renders with correct sections per role
- [ ] Breadcrumbs show on test pages
- [ ] User menu expanded with role actions
- [ ] Mobile nav shows role-specific items
- [ ] Search bar UI functional
- [ ] No TypeScript errors
- [ ] Build succeeds

### After M2:
- [ ] All 10 priority pages reachable from menu
- [ ] Dashboard cards link correctly
- [ ] Eventi flow navigable: list → detail → settings
- [ ] Admin pages have breadcrumbs
- [ ] PR pages accessible and linked
- [ ] Search returns real results
- [ ] Legacy redirects work
- [ ] All 7 roles tested
- [ ] No broken links

---

## 🚨 ROLLBACK PLAN

### If Critical Issues:
1. Revert `src/app/layout.tsx` (remove Navbar)
2. Revert `src/app/dashboard/layout.tsx` (remove Sidebar)
3. Restore original `user-nav.tsx` and `mobile-nav.tsx`
4. Keep new pages isolated until fixed

### Git Strategy:
```bash
# Branch per milestone
git checkout -b feature/milestone-1-navigation
# ... commits ...
git checkout -b feature/milestone-2-connections
```

---

## 📊 FINAL METRICS

**Total Files Impacted:** ~48  
**New Components:** 15  
**Enhanced Components:** 3  
**New Pages:** 4  
**Modified Pages:** 15+  
**New API Endpoints:** 1  
**Estimated LOC:** ~3,000

---

**Status:** Ready for implementation  
**Next:** Begin M1 Phase 1.A - Foundation
