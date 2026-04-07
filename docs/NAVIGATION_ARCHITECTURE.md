# 🗺️ Architettura Navigazione Eventry

## 📐 Struttura Proposta

### Global Layout Hierarchy
```
RootLayout
├── Navbar (Desktop Header)
│   ├── Logo + Brand
│   ├── Search Global
│   ├── Notifications
│   └── UserNav Dropdown
│
├── Sidebar (Dashboard Only)
│   ├── Navigation Links (role-based)
│   ├── Quick Actions
│   └── Collapse Toggle
│
├── Breadcrumbs (Context aware)
│
├── Page Content
│   └── {children}
│
└── MobileNav (Bottom Bar Mobile)
    ├── Home
    ├── Eventi
    ├── Check-in
    └── Avatar Menu
```

---

## 🎭 Navigazione per Ruolo

### ADMIN
```
Navbar: Home | Eventi | Feed | Analytics | Admin Panel
Sidebar:
  📊 Dashboard
  🎉 Gestione Eventi
  🎫 Tutti i Biglietti
  👥 Gestione Utenti
  📈 Analytics Globali
  📧 Log Email
  ⚙️ Sistema
  🔒 Sicurezza
```

### ORGANIZER
```
Navbar: Home | Eventi | Feed | Analytics
Sidebar:
  📊 Dashboard
  🎉 I Miei Eventi
     ├─ Crea Evento
     ├─ Calendario
     └─ Archivio
  📋 Liste & PR
     ├─ Gestione PR
     └─ Quote Omaggi
  🎫 Biglietti
  👥 Clienti/Guest
  📈 Analytics
  📱 Marketing
  🏢 Venues/Clubs
  ⚙️ Settings
```

### PR
```
Navbar: Home | Eventi | I Miei Omaggi
Sidebar:
  📊 Dashboard PR
  🎟️ Quote Omaggi
     ├─ Eventi Assegnati
     ├─ Disponibilità
     └─ Storico
  📋 Le Mie Liste
  🔍 Scanner Check-in
  📊 Le Mie Stats
  ⚙️ Profilo
```

### DJ/ARTIST
```
Navbar: Home | Eventi | Dashboard DJ
Sidebar:
  🎵 Dashboard DJ
  📅 Performances
  📊 Schedule
  🎼 Media Gallery
  📈 Stats & Insights
  ⚙️ Profilo Artista
```

### USER
```
Navbar: Home | Eventi | Feed | Biglietti
Sidebar:
  🎟️ I Miei Biglietti
  📅 Eventi Prenotati
  ❤️ Preferiti
  👤 Il Mio Profilo
  📱 Feed
  ⚙️ Settings
```

---

## 🔗 Collegamenti Chiave

### Homepage → App
```
/ (landing)
  ├─ [Login] → /dashboard (redirect role-based)
  ├─ [Register] → /onboarding/step-2
  └─ [Scopri] → /eventi (public gallery)
```

### Eventi Flow
```
/dashboard → Events Card
  └─ Click → /eventi/[id]
      ├─ [Settings] → /eventi/[id]/settings
      │   └─ [Omaggi] → /eventi/[id]/settings/complimentary
      ├─ [Analytics] → /analytics/[eventId]
      ├─ [Check-in] → /checkin?eventId=[id]
      ├─ [Consumazioni] → /eventi/[id]/consumazioni
      └─ [Checkout] → /eventi/[id]/checkout
```

### PR Workflow
```
/dashboard (PR)
  └─ [Quote Omaggi] → /api/pr/[prId]/complimentary-quota
      ├─ Select Event
      ├─ [Assegna Omaggio] → /api/tickets/issue (isComplimentary=true)
      └─ [Storico] → View ComplimentaryAssignmentLog
```

### Admin Panel
```
/admin
  ├─ [Utenti] → /admin/users
  ├─ [Eventi] → /admin/events
  ├─ [Biglietti] → /admin/tickets
  ├─ [Email Log] → /admin/emails
  └─ [Sistema] → /admin/system
```

---

## 🎨 Componenti da Creare

### 1. Navbar.tsx (Desktop Header)
```tsx
<Navbar>
  <Logo />
  <SearchBar />
  <NavLinks role={user.role} />
  <Notifications />
  <UserNav />
</Navbar>
```

### 2. Sidebar.tsx (Dashboard Lateral Menu)
```tsx
<Sidebar collapsed={collapsed}>
  <NavSection title="Dashboard">
    <NavItem icon={Home} href="/dashboard" />
    <NavItem icon={Calendar} href="/eventi" />
  </NavSection>
  <NavSection title="Gestione" roles={['ADMIN', 'ORGANIZER']}>
    <NavItem icon={Ticket} href="/biglietti" />
    <NavItem icon={Users} href="/clienti" />
  </NavSection>
</Sidebar>
```

### 3. Breadcrumbs.tsx
```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/dashboard">Dashboard</BreadcrumbItem>
  <BreadcrumbItem href="/eventi">Eventi</BreadcrumbItem>
  <BreadcrumbItem current>Evento X</BreadcrumbItem>
</Breadcrumbs>
```

### 4. SearchBar.tsx (Global Search)
```tsx
<SearchBar placeholder="Cerca eventi, utenti...">
  <SearchResults>
    <SearchSection title="Eventi" items={events} />
    <SearchSection title="Utenti" items={users} />
  </SearchResults>
</SearchBar>
```

---

## 🚀 Implementation Phases

### Phase 1: Core Navigation (Week 1)
- [x] Navbar desktop component
- [x] Sidebar component with role-based menu
- [x] Breadcrumbs component
- [x] Layout integration

### Phase 2: Connections (Week 2)
- [ ] Connect all existing pages
- [ ] Add missing links in cards
- [ ] Fix redirect flows
- [ ] Add quick actions menus

### Phase 3: Enhanced UX (Week 3)
- [ ] Search bar functionality
- [ ] Notifications system
- [ ] Empty states with CTAs
- [ ] Loading skeletons

### Phase 4: Polish (Week 4)
- [ ] Animations & transitions
- [ ] Mobile responsiveness
- [ ] Keyboard shortcuts
- [ ] Accessibility (a11y)

---

## 📝 Notes

- UserNav già esistente, estenderlo con più opzioni
- MobileNav già funzionante, mantenerlo
- Focus su desktop experience first
- Progressive enhancement per mobile
- Role-based rendering per sicurezza

---

## 🔐 Security Considerations

- Middleware per controllo auth su tutte le route
- Role-based menu rendering (client + server)
- Protected API endpoints con requireAuth
- Redirect unauthorized users to /unauthorized
