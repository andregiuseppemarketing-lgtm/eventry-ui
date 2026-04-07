# 🎨 EVENTRY - Design Shell Navigazione Globale

**Data:** 9 marzo 2026  
**Design by:** Product Architect + UX Lead + Frontend Tech Lead

---

## TASK 2 — SHELL NAVIGAZIONE GLOBAL ROLE-BASED

### 🏗️ ARCHITETTURA GLOBALE

```
┌──────────────────────────────────────────────────────────┐
│  NAVBAR DESKTOP (Persistent Top Bar - All Roles)         │
│  Logo | Search | [Role-Based Links] | Notif | UserMenu  │
└──────────────────────────────────────────────────────────┘
         │
         ├─────────────┬──────────────────────────────────┐
         │             │                                  │
┌────────▼──────┐ ┌───▼──────────────────┐ ┌────────────▼────────┐
│  SIDEBAR      │ │  MAIN CONTENT        │ │  MOBILE NAV         │
│  (Dashboard)  │ │  + BREADCRUMBS       │ │  (Bottom Bar)       │
│  Role-Based   │ │                      │ │  Home|Eventi|+|Menu │
└───────────────┘ └──────────────────────┘ └─────────────────────┘
```

---

## 📱 COMPONENTI NAVIGAZIONE

### 1. **NAVBAR DESKTOP** (Header Globale)

#### Struttura:
```tsx
<Navbar>
  <Logo href="/dashboard" />
  <SearchBar />
  <NavLinks role={user.role}>
    {/* Dinamici per ruolo */}
  </NavLinks>
  <Notifications />
  <UserMenu />
</Navbar>
```

#### Contenuto per Ruolo:

**ADMIN:**
- 🏠 Dashboard
- 🎉 Eventi
- 📊 Analytics
- ⚡ Admin Panel (with badge)
- 🔍 Search

**ORGANIZER:**
- 🏠 Dashboard
- 🎉 I Miei Eventi
- 📊 Analytics
- 🏢 I Miei Locali
- 🔍 Search

**PR:**
- 🏠 Dashboard
- 🎟️ I Miei Omaggi
- 📋 Le Mie Liste
- 🔍 Search

**DJ/ARTIST:**
- 🏠 Dashboard
- 🎵 Performances
- 📅 Schedule
- 🔍 Search

**VENUE:**
- 🏠 Dashboard
- 🎉 Eventi del Locale
- 📊 Stats Locale
- 🔍 Search

**STAFF/SECURITY:**
- 🏠 Dashboard
- ✅ Check-in
- 🎫 Scanner
- 📊 Situazione Live

**USER:**
- 🏠 Home
- 🎉 Eventi
- 🎫 I Miei Biglietti
- 📱 Feed
- 🔍 Search

---

### 2. **SIDEBAR** (Navigation Laterale Dashboard)

#### Collapsible, Role-Based, con Sezioni

---

#### **SIDEBAR - ADMIN**

```tsx
<Sidebar>
  <SidebarSection title="Dashboard">
    📊 Overview                → /dashboard
    📈 Analytics Globali       → /analytics/general
  </SidebarSection>

  <SidebarSection title="Admin Panel">
    👥 Gestione Utenti         → /admin/users
    🎉 Gestione Eventi         → /admin/events
    🎫 Gestione Biglietti      → /admin/tickets
    🏢 Venues & Clubs          → /clubs
    🔒 Verifica Identità       → /dashboard/verifica-identita
    📧 Log Email               → /admin/emails
    ⚙️ Sistema                 → /admin/system
  </SidebarSection>

  <SidebarSection title="Marketing">
    📱 Tools Marketing         → /dashboard/marketing
    📊 Funnel Conversion       → /marketing/funnel
  </SidebarSection>

  <SidebarSection title="Operazioni">
    ✅ Check-in Scanner        → /checkin
    📋 Situazione Live         → /situa
  </SidebarSection>

  <SidebarSection title="Account">
    👤 Il Mio Profilo          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

**Badge/Notifiche:**
- Verifica Identità (pending count)
- Eventi in attesa approval
- Email failed

---

#### **SIDEBAR - ORGANIZER**

```tsx
<Sidebar>
  <SidebarSection title="Dashboard">
    📊 Overview                → /dashboard
    📈 Analytics               → /analytics/general
  </SidebarSection>

  <SidebarSection title="Eventi">
    🎉 I Miei Eventi           → /eventi
    ➕ Crea Nuovo Evento       → /eventi/nuovo
    📅 Calendario              → /eventi?view=calendar
    🗂️ Archivio                → /eventi?status=past
  </SidebarSection>

  <SidebarSection title="Gestione">
    📋 Liste & PR              → /lista
    👥 Clienti/Guest           → /clienti
    🎫 Biglietti               → /dashboard/tickets
    🏢 I Miei Locali           → /clubs
  </SidebarSection>

  <SidebarSection title="Operazioni">
    ✅ Check-in Scanner        → /checkin
    📊 Situazione Live         → /situa
  </SidebarSection>

  <SidebarSection title="Account">
    👤 Il Mio Profilo          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

**Quick Actions:**
- [+ Crea Evento] button prominent
- [Scanner Check-in] floating action

---

#### **SIDEBAR - PR**

```tsx
<Sidebar>
  <SidebarSection title="Dashboard">
    📊 Il Mio Dashboard        → /dashboard
    📈 Le Mie Statistiche      → /pr/stats (TODO)
  </SidebarSection>

  <SidebarSection title="Biglietti Omaggio">
    🎟️ Quote Disponibili       → /pr/omaggi (TODO)
    ➕ Assegna Omaggio         → /pr/assegna (TODO)
    📜 Storico Assegnazioni    → /pr/storico (TODO)
  </SidebarSection>

  <SidebarSection title="Liste & Eventi">
    📋 Le Mie Liste            → /lista
    🎉 Eventi Assegnati        → /pr/eventi (TODO)
  </SidebarSection>

  <SidebarSection title="Operazioni">
    ✅ Check-in Scanner        → /checkin
  </SidebarSection>

  <SidebarSection title="Account">
    👤 Il Mio Profilo          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

**Highlight:**
- Badge con quota disponibile/usata per evento
- CTA "Assegna Omaggio" prominente

---

#### **SIDEBAR - DJ/ARTIST**

```tsx
<Sidebar>
  <SidebarSection title="Dashboard">
    🎵 Dashboard DJ            → /dj/dashboard
  </SidebarSection>

  <SidebarSection title="Performances">
    📅 Il Mio Schedule         → /dj/schedule (TODO)
    🎤 Prossime Serate         → /dj/upcoming (TODO)
    🗂️ Storico                 → /dj/history (TODO)
  </SidebarSection>

  <SidebarSection title="Media">
    🎼 Gallery Media           → /dj/media (TODO)
    🎧 Tracks & Mixes          → /dj/tracks (TODO)
  </SidebarSection>

  <SidebarSection title="Statistiche">
    📊 Le Mie Stats            → /dj/stats (TODO)
    ⭐ Feedback                → /dj/feedback (TODO)
  </SidebarSection>

  <SidebarSection title="Account">
    👤 Profilo Artista         → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

---

#### **SIDEBAR - VENUE**

```tsx
<Sidebar>
  <SidebarSection title="Dashboard">
    📊 Dashboard Locale        → /dashboard
  </SidebarSection>

  <SidebarSection title="Eventi">
    🎉 Eventi del Locale       → /venue/eventi (TODO)
    📅 Calendario              → /venue/calendar (TODO)
  </SidebarSection>

  <SidebarSection title="Gestione">
    🎫 Biglietti Venduti       → /venue/tickets (TODO)
    💰 Incassi                 → /venue/revenue (TODO)
    📊 Analytics Locale        → /venue/analytics (TODO)
  </SidebarSection>

  <SidebarSection title="Operazioni">
    ✅ Check-in Scanner        → /checkin
    📊 Situazione Live         → /situa
  </SidebarSection>

  <SidebarSection title="Account">
    🏢 Profilo Locale          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

---

#### **SIDEBAR - STAFF/SECURITY**

```tsx
<Sidebar>
  <SidebarSection title="Operazioni">
    ✅ Scanner Check-in        → /checkin
    📊 Situazione Live         → /situa
    📋 Dashboard Check-in      → /dashboard/checkin
  </SidebarSection>

  <SidebarSection title="Eventi">
    🎉 Eventi di Oggi          → /staff/eventi (TODO)
  </SidebarSection>

  <SidebarSection title="Account">
    👤 Il Mio Profilo          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

**Minimal Interface:**
- Focus su check-in e operazioni porta
- Accesso rapido a scanner

---

#### **SIDEBAR - USER**

```tsx
<Sidebar>
  <SidebarSection title="I Miei Biglietti">
    🎫 Biglietti Attivi        → /biglietti
    🗂️ Storico                 → /biglietti?status=past
  </SidebarSection>

  <SidebarSection title="Eventi">
    🎉 Scopri Eventi           → /feed (eventi pubblici)
    📅 Eventi Prenotati        → /biglietti?view=events
    ❤️ Preferiti               → /user/favorites (TODO)
  </SidebarSection>

  <SidebarSection title="Social">
    📱 Feed                    → /feed
    👥 Following               → /user/following (TODO)
  </SidebarSection>

  <SidebarSection title="Account">
    👤 Il Mio Profilo          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
  </SidebarSection>
</Sidebar>
```

---

### 3. **USER MENU** (Dropdown Desktop)

#### Contenuto Globale (tutti i ruoli):

```tsx
<UserMenu>
  <UserInfo>
    <Avatar />
    <Name>{user.name}</Name>
    <Email>{user.email}</Email>
    <RoleBadge>{user.role}</RoleBadge>
  </UserInfo>

  <MenuSection title="Account">
    👤 Il Mio Profilo          → /dashboard/profilo
    ⚙️ Impostazioni            → /dashboard/settings
    🔒 Privacy & GDPR          → /gdpr
  </MenuSection>

  {user.role === 'ADMIN' && (
    <MenuSection title="Admin">
      ⚡ Admin Panel            → /admin
      📧 Email Logs             → /admin/emails
    </MenuSection>
  )}

  {user.role === 'ORGANIZER' && (
    <MenuSection title="Quick Actions">
      ➕ Nuovo Evento           → /eventi/nuovo
      🎫 Scanner                → /checkin
    </MenuSection>
  )}

  <MenuSection title="Help">
    ❓ Centro Assistenza       → /help (TODO)
    📚 Documentazione          → /docs (TODO)
  </MenuSection>

  <MenuDivider />

  <MenuItem variant="danger">
    🚪 Logout                  → signOut()
  </MenuItem>
</UserMenu>
```

---

### 4. **BREADCRUMBS** (Context Navigation)

#### Esempi per Contesto:

```tsx
// Evento Settings
Dashboard > Eventi > Rock Festival 2026 > Settings > Quote Omaggi

// Cliente Detail
Dashboard > Clienti > Mario Rossi

// Admin Users
Admin Panel > Gestione Utenti

// Analytics
Dashboard > Analytics > Evento XYZ

// PR Quota
Dashboard > I Miei Omaggi > Rock Festival 2026
```

#### Componente:
```tsx
<Breadcrumbs>
  <BreadcrumbItem href="/dashboard" icon={Home}>
    Dashboard
  </BreadcrumbItem>
  <BreadcrumbItem href="/eventi">
    Eventi
  </BreadcrumbItem>
  <BreadcrumbItem href={`/eventi/${eventId}`}>
    {event.title}
  </BreadcrumbItem>
  <BreadcrumbItem current>
    Settings
  </BreadcrumbItem>
</Breadcrumbs>
```

---

### 5. **MOBILE NAV** (Bottom Bar)

#### Struttura Base (User):
```tsx
<MobileNav>
  <NavItem icon={Home} label="Home" href="/dashboard" />
  <NavItem icon={Calendar} label="Eventi" href="/feed" />
  <NavItem icon={Ticket} label="Biglietti" href="/biglietti" />
  <NavItem icon={User} label="Menu">
    <Sheet> {/* Full menu */} </Sheet>
  </NavItem>
</MobileNav>
```

#### Mobile Nav per ORGANIZER/ADMIN:
```tsx
<MobileNav>
  <NavItem icon={Home} label="Dashboard" href="/dashboard" />
  <NavItem icon={Calendar} label="Eventi" href="/eventi" />
  <NavItem icon={QrCode} label="Check-in" href="/checkin" />
  <NavItem icon={User} label="Menu">
    <Sheet> {/* Full sidebar menu */} </Sheet>
  </NavItem>
</MobileNav>
```

#### Mobile Nav per PR:
```tsx
<MobileNav>
  <NavItem icon={Home} label="Dashboard" href="/dashboard" />
  <NavItem icon={Gift} label="Omaggi" href="/pr/omaggi" />
  <NavItem icon={List} label="Liste" href="/lista" />
  <NavItem icon={User} label="Menu">
    <Sheet> {/* Full sidebar menu */} </Sheet>
  </NavItem>
</MobileNav>
```

#### Mobile Nav per STAFF:
```tsx
<MobileNav>
  <NavItem icon={QrCode} label="Scanner" href="/checkin" />
  <NavItem icon={Activity} label="Situa" href="/situa" />
  <NavItem icon={User} label="Menu">
    <Sheet> {/* Full sidebar menu */} </Sheet>
  </NavItem>
</MobileNav>
```

---

### 6. **SEARCH BAR** (Global Search)

#### Funzionalità:
- Search eventi per titolo/data/venue
- Search utenti per nome/email
- Search clienti per nome/phone
- Search venues

#### Risultati Categorizzati:
```tsx
<SearchResults>
  <SearchSection title="Eventi" icon={Calendar}>
    {events.map(event => (
      <SearchItem href={`/eventi/${event.id}`}>
        {event.title} - {event.dateStart}
      </SearchItem>
    ))}
  </SearchSection>

  <SearchSection title="Clienti" icon={Users}>
    {clients.map(client => (
      <SearchItem href={`/clienti/${client.id}`}>
        {client.firstName} {client.lastName}
      </SearchItem>
    ))}
  </SearchSection>

  <SearchSection title="Venues" icon={Building}>
    {venues.map(venue => (
      <SearchItem href={`/venue/${venue.slug}`}>
        {venue.name} - {venue.city}
      </SearchItem>
    ))}
  </SearchSection>
</SearchResults>
```

---

## 🎯 PRINCIPI DESIGN

### 1. **Role-Based Rendering**
- Sidebar content cambia completamente per ruolo
- Navbar links adattati al ruolo
- User menu con quick actions contestuali

### 2. **Progressive Disclosure**
- Sidebar collapsible su desktop
- Sezioni espandibili con sottovoci
- Badge per notifiche/counts

### 3. **Consistent Patterns**
- Icons consistenti (Lucide React)
- Colori dedicati per ruoli (badge)
- Spacing e typography standard

### 4. **Mobile-First Actions**
- Bottom nav con max 4 azioni principali
- FAB (Floating Action Button) per azione primaria
- Full-screen sheet per menu completo

### 5. **Context Awareness**
- Breadcrumbs sempre visibili
- Active state per item corrente
- Quick links contestuali

---

## 📊 RIEPILOGO VOCI MENU PER RUOLO

| Ruolo | Navbar Links | Sidebar Sections | Mobile Nav Items |
|-------|--------------|------------------|------------------|
| **ADMIN** | 5 | 5 (20+ voci) | 4 |
| **ORGANIZER** | 5 | 5 (15+ voci) | 4 |
| **PR** | 4 | 5 (10+ voci) | 4 |
| **DJ** | 4 | 5 (10+ voci) | 3 |
| **VENUE** | 4 | 5 (12+ voci) | 4 |
| **STAFF** | 3 | 3 (6 voci) | 3 |
| **USER** | 5 | 4 (8 voci) | 4 |

---

## ✅ SIGN-OFF

Questa shell garantisce:
- ✅ Navigazione chiara per ogni ruolo
- ✅ Accesso rapido a funzioni core
- ✅ Scalabilità per nuove sezioni
- ✅ Coerenza visiva e UX
- ✅ Mobile responsive
