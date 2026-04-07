# 🚀 EVENTRY - Milestone Implementation Plan

**Data:** 9 marzo 2026  
**Planning by:** Frontend Tech Lead + Product Architect

---

## TASK 3 — MILESTONE 1 & 2 DEFINITION

### 📋 STRATEGIA IMPLEMENTAZIONE

**Approccio:** Build foundation first, then connect flows  
**Durata stimata:** Milestone 1 = 3-4 giorni | Milestone 2 = 2-3 giorni  
**Principio:** Non rompere l'esistente, aggiungere progressive enhancement

---

## 🎯 MILESTONE 1: SHELL NAVIGAZIONE (Foundation)

### Obiettivo:
Creare l'infrastruttura di navigazione globale role-based, senza ancora collegare tutte le pagine esistenti.

### Deliverables:
✅ Navbar desktop funzionante
✅ Sidebar dashboard role-based  
✅ Breadcrumbs component  
✅ Mobile nav esteso  
✅ User menu migliorato  
✅ Search bar (UI, funzionalità base)

---

### **STEP 1.1: Componenti Base**

#### File da CREARE:

```
src/components/navigation/
├── navbar.tsx                      # Navbar desktop globale
├── sidebar.tsx                     # Sidebar principale con role logic
├── sidebar-section.tsx             # Section collapsible
├── sidebar-item.tsx                # Single navigation item
├── breadcrumbs.tsx                 # Breadcrumb navigation
├── search-bar.tsx                  # Global search
├── search-results.tsx              # Search dropdown results
└── role-badge.tsx                  # Badge per visualizzare ruolo
```

#### Componenti da MODIFICARE:

```
src/components/
├── user-nav.tsx                    # ✏️ Estendere con più voci menu
├── mobile-nav.tsx                  # ✏️ Rendere role-based
└── providers.tsx                   # ⚠️ No changes (query client ok)
```

---

### **STEP 1.2: Layout Updates**

#### File da MODIFICARE:

```
src/app/
├── layout.tsx                      # ✏️ Aggiungere Navbar globale
│
├── dashboard/
│   └── layout.tsx                  # 🆕 CREARE - Sidebar + content wrapper
│
├── admin/
│   └── layout.tsx                  # 🆕 CREARE - Admin sidebar
│
├── eventi/
│   └── layout.tsx                  # 🆕 CREARE - Eventi breadcrumbs
│
└── pr/                             # 🆕 CREARE - Sezione PR
    └── layout.tsx                  # 🆕 CREARE - PR sidebar
```

---

### **STEP 1.3: Types & Utils**

#### File da CREARE:

```
src/types/
└── navigation.ts                   # Types per nav items, user roles, etc.

src/lib/
├── navigation-config.ts            # Config sidebar per ruolo
└── navigation-utils.ts             # Helper per active state, permissions
```

#### Contenuto `navigation-config.ts`:
```ts
export const NAVIGATION_CONFIG = {
  ADMIN: {
    navbar: [...],
    sidebar: [...],
    mobileNav: [...],
  },
  ORGANIZER: { ... },
  PR: { ... },
  // etc...
};
```

---

### **STEP 1.4: Ordine Implementazione Milestone 1**

#### **Fase 1.A - Foundation (Giorno 1)**
1. ✅ Creare `types/navigation.ts`
2. ✅ Creare `lib/navigation-config.ts` con menu per tutti i ruoli
3. ✅ Creare `components/navigation/role-badge.tsx`
4. ✅ Creare `components/navigation/sidebar-item.tsx`
5. ✅ Creare `components/navigation/sidebar-section.tsx`

#### **Fase 1.B - Core Components (Giorno 1-2)**
6. ✅ Creare `components/navigation/navbar.tsx`
7. ✅ Creare `components/navigation/sidebar.tsx`
8. ✅ Estendere `components/user-nav.tsx`
9. ✅ Modificare `components/mobile-nav.tsx` per role-based

#### **Fase 1.C - Navigation Utilities (Giorno 2)**
10. ✅ Creare `components/navigation/breadcrumbs.tsx`
11. ✅ Creare `components/navigation/search-bar.tsx` (UI only)
12. ✅ Creare `components/navigation/search-results.tsx`

#### **Fase 1.D - Layout Integration (Giorno 2-3)**
13. ✅ Modificare `src/app/layout.tsx` → aggiungere Navbar
14. ✅ Creare `src/app/dashboard/layout.tsx` → Sidebar + wrapper
15. ✅ Creare `src/app/admin/layout.tsx` → Admin sidebar
16. ✅ Test visual per tutti i ruoli

#### **Fase 1.E - Polish & Testing (Giorno 3-4)**
17. ✅ Responsive testing mobile/tablet/desktop
18. ✅ Dark mode compatibility
19. ✅ Active states e hover effects
20. ✅ Accessibility (keyboard nav, aria labels)

---

### **File Summary Milestone 1**

| Azione | Quantità | File |
|--------|----------|------|
| **Creare** | 15 | navigation components, layouts, types |
| **Modificare** | 3 | user-nav, mobile-nav, root layout |
| **Testare** | 7 | Ruoli diversi |

**Totale file touched:** 18

---

## 🔗 MILESTONE 2: COLLEGAMENTO FLUSSI CORE (Connections)

### Obiettivo:
Collegare le pagine esistenti alla shell di navigazione, implementare redirect, creare pagine hub mancanti.

### Deliverables:
✅ Tutte le pagine raggiungibili da menu
✅ Flusso Eventi completo  
✅ Flusso Admin connesso  
✅ Flusso PR base  
✅ Redirect legacy pages

---

### **STEP 2.1: Pagine Hub da Creare**

#### File da CREARE:

```
src/app/
├── eventi/
│   ├── page.tsx                    # 🆕 Lista eventi ORGANIZER
│   └── [id]/
│       ├── page.tsx                # 🆕 Dettaglio evento hub
│       └── settings/
│           └── page.tsx            # 🆕 Settings hub (complimentary è sotto-sez)
│
├── pr/
│   ├── page.tsx                    # 🆕 PR dashboard redirect
│   ├── omaggi/
│   │   └── page.tsx                # 🆕 Lista quota disponibili
│   └── eventi/
│       └── page.tsx                # 🆕 Eventi assegnati a PR
│
└── liste/
    └── [listId]/
        └── page.tsx                # 🆕 Dettaglio lista singola
```

**Priorità Alta:** (implementare in Milestone 2)
- `/eventi` - Lista eventi ORGANIZER
- `/eventi/[id]` - Hub dettaglio evento

**Priorità Media:** (posticipabili)
- `/pr/omaggi`
- `/eventi/[id]/settings` (hub)

---

### **STEP 2.2: Redirect & Consolidamento**

#### File da MODIFICARE/REDIRECT:

```
src/app/
├── user/
│   └── profilo/
│       └── page.tsx                # ✏️ Redirect → /dashboard/profilo
│
├── dashboard/
│   └── admin/
│       └── page.tsx                # ✏️ Redirect → /admin
│
└── middleware.ts                   # ✏️ Aggiungere redirect automatici
```

#### Redirect Mapping:
```ts
const REDIRECTS = {
  '/user/profilo': '/dashboard/profilo',
  '/dashboard/admin': '/admin',
};
```

---

### **STEP 2.3: Collegamenti Pagine Esistenti**

#### File da MODIFICARE (aggiungere link da/verso):

**Priority 1 - Dashboard Hub:**
```
src/app/dashboard/page.tsx
├─ Aggiungere link a: /eventi, /admin, /pr/omaggi, /clubs, /analytics/general
└─ Card stats cliccabili verso sezioni
```

**Priority 2 - Admin Pages:**
```
src/app/admin/*.tsx
├─ Aggiungere breadcrumbs
├─ Link back to /admin hub
└─ Inter-section links
```

**Priority 3 - Eventi Flow:**
```
src/app/eventi/[id]/settings/complimentary/page.tsx
├─ Aggiungere breadcrumbs: Dashboard > Eventi > [title] > Settings > Omaggi
├─ Link back to /eventi/[id]
└─ Link to /eventos/[id]/settings (hub)
```

**Priority 4 - Altre Sezioni:**
```
src/app/
├── lista/page.tsx                  # Breadcrumbs + link to liste/[id]
├── clienti/page.tsx                # Search bar, link to clienti/[id]
├── clubs/page.tsx                  # Breadcrumbs, link to clubs/[id]
├── analytics/general/page.tsx      # Link to analytics/[eventId]
└── biglietti/page.tsx              # Breadcrumbs, ticket cards link
```

---

### **STEP 2.4: Search Functionality**

#### API Endpoint da CREARE:

```
src/app/api/search/
└── route.ts                        # Global search endpoint
```

**Query:**
```ts
GET /api/search?q={query}&type={events|users|clients|venues}
```

**Response:**
```json
{
  "events": [...],
  "clients": [...],
  "venues": [...],
  "users": [...]
}
```

---

### **STEP 2.5: Ordine Implementazione Milestone 2**

#### **Fase 2.A - Pagine Hub Core (Giorno 1)**
1. ✅ Creare `/eventi/page.tsx` - Lista eventi ORGANIZER
2. ✅ Creare `/eventi/[id]/page.tsx` - Hub evento con tabs/cards
3. ✅ Modificare `/dashboard/page.tsx` - Aggiungere link cards
4. ✅ Aggiungere breadcrumbs a `/eventi/[id]/settings/complimentary`

#### **Fase 2.B - Collegamenti Admin (Giorno 1-2)**
5. ✅ Aggiungere breadcrumbs a tutti `/admin/*` pages
6. ✅ Creare inter-links tra admin sections
7. ✅ Consolidare redirect `/dashboard/admin` → `/admin`

#### **Fase 2.C - Collegamenti Secondari (Giorno 2)**
8. ✅ Aggiungere breadcrumbs a `/lista`, `/clienti`, `/clubs`
9. ✅ Link da dashboard cards a sezioni specifiche
10. ✅ Consolidare redirect `/user/profilo` → `/dashboard/profilo`

#### **Fase 2.D - Pagine PR (Giorno 2-3)**
11. ✅ Creare `/pr/omaggi/page.tsx` (lista quota PR)
12. ✅ Collegare da sidebar PR
13. ✅ Breadcrumbs e link verso `/eventi/[id]/settings/complimentary`

#### **Fase 2.E - Search & Polish (Giorno 3)**
14. ✅ Creare `/api/search/route.ts`
15. ✅ Implementare search bar functionality
16. ✅ Test completo navigazione per tutti i ruoli
17. ✅ Fix broken links e edge cases

---

### **File Summary Milestone 2**

| Azione | Quantità | File |
|--------|----------|------|
| **Creare** | 6 | Pagine hub nuove, API search |
| **Modificare** | 15-20 | Aggiungere link, breadcrumbs, redirect |
| **Redirect** | 3 | Consolidare duplicati |

**Totale file touched:** 25-30

---

## 📊 SUMMARY TOTALE

### Milestone 1 + 2 Combined

| Categoria | M1 | M2 | Totale |
|-----------|----|----|--------|
| **File Creati** | 15 | 6 | **21** |
| **File Modificati** | 3 | 20 | **23** |
| **Redirect** | 0 | 3 | **3** |
| **API Endpoint** | 0 | 1 | **1** |
| **Test Ruoli** | 7 | 7 | **7** |
| **Giorni Stima** | 3-4 | 2-3 | **5-7** |

**Totale file touched:** 48

---

## ✅ ACCEPTANCE CRITERIA

### Milestone 1:
- [ ] Ogni ruolo vede sidebar con menu appropriato
- [ ] Navbar responsive desktop/mobile
- [ ] Breadcrumbs funzionanti su almeno 3 pages
- [ ] User menu con tutte le voci role-based
- [ ] Mobile nav con bottom bar coerente
- [ ] Search bar visibile (funzionalità base)
- [ ] Build passa senza errori
- [ ] Dark mode compatibile

### Milestone 2:
- [ ] Tutte le 10 pagine prioritarie raggiungibili da menu
- [ ] Dashboard cards linkano a sezioni appropriate
- [ ] Admin panel completamente navigabile
- [ ] Flusso eventi: dashboard → lista → dettaglio → settings funzionante
- [ ] Redirect legacy pages operativi
- [ ] Search bar funzionale per eventi/clienti
- [ ] Breadcrumbs su almeno 15 pagine
- [ ] Zero pagine isolate tra le prioritarie
- [ ] Test manuale OK per tutti i 7 ruoli

---

## 🎯 RISK MITIGATION

### Risk 1: Breaking Existing Pages
**Mitigation:** 
- Layout changes solo additivi
- Mantenere layout esistenti dove possibile
- Feature flags per gradual rollout

### Risk 2: Performance Issues
**Mitigation:**
- Lazy load sidebar content
- Memoize navigation config
- Virtualize long lists (eventi, clienti)

### Risk 3: Mobile UX Regressa
**Mitigation:**
- Test su device reali
- Mantieni MobileNav esistente funzionante
- Progressive enhancement approccio

---

## 📦 DEPENDENCIES

### External Libraries (già presenti):
- ✅ `lucide-react` - Icons
- ✅ `@radix-ui/*` - Primitives (Sheet, Dropdown, etc.)
- ✅ `next-auth` - Session management
- ✅ `tailwindcss` - Styling

### No New Dependencies Required

---

## 🚀 GO/NO-GO DECISION

### GO Criteria:
- [x] Audit completo fatto
- [x] Design shell approvato
- [x] Milestone plan dettagliato
- [x] Team capacity disponibile
- [ ] **Approval dal team** ← WAITING

### Blockers:
- Nessuno identificato

---

## ✅ SIGN-OFF & NEXT STEPS

**Status:** Ready for implementation  
**Owner:** Frontend Tech Lead  
**Reviewers:** Product Manager, UX Lead

**Next Action:** Proceed with Milestone 1 - Fase 1.A
