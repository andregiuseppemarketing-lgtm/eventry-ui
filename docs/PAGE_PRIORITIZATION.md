# 🎯 EVENTRY - Page Connection Prioritization

**Data:** 9 marzo 2026  
**Planning by:** Product Architect + UX Lead

---

## TASK 5 — TOP 10 PAGE PRIORITIZATION & IMPLEMENTATION ORDER

### 📋 OBIETTIVO

Identificare le 10 pagine più critiche da collegare per primo, con:
- Rationale business/UX per ogni pagina
- Impact score (ROI)
- Implementation effort
- Dependencies
- Order esatto di implementazione

---

## 🔥 PRIORITIZATION FRAMEWORK

### Scoring Criteria:

| Criterio | Peso | Descrizione |
|----------|------|-------------|
| **Business Critical** | 40% | Blocca revenue o operazioni core |
| **User Impact** | 30% | Quanti utenti ne beneficiano |
| **Isolation Status** | 20% | Completamente isolata vs partially connected |
| **Implementation Ease** | 10% | Effort stimato |

### Formula:
```
Priority Score = (Business × 0.4) + (Impact × 0.3) + (Isolation × 0.2) + (Ease × 0.1)
```

---

## 🏆 TOP 10 PAGES - RANKED

---

### **#1 — `/admin` (Admin Panel Hub)**

**Current Status:** 🔴 Completamente isolata  
**Roles:** ADMIN  
**Function:** Hub centrale per gestione piattaforma

#### Metrics:
- **Business Critical:** 10/10 — Gestione core della piattaforma
- **User Impact:** 7/10 — Solo ADMIN ma operazioni critiche
- **Isolation Status:** 10/10 — Zero navigation paths
- **Implementation Ease:** 9/10 — Solo aggiungere link in navbar/sidebar

**Priority Score:** `(10×0.4) + (7×0.3) + (10×0.2) + (9×0.1) = 8.0`

#### Why Priority #1:
- Admin non può accedere al proprio pannello senza URL memorizzato
- Blocca: gestione utenti, organizers, payments, verifica identità
- Quick win: solo aggiungere link, pagina già esiste e funziona

#### Implementation:
```typescript
// Already exists: src/app/admin/page.tsx
// Action: Add to sidebar + navbar (M1)
// Effort: 5 minutes
```

#### Dependencies:
- Milestone 1 completed (Navbar + Sidebar)
- No page changes needed

---

### **#2 — `/eventi/[id]/settings/complimentary` (Quote Omaggi)**

**Current Status:** 🟡 Partially connected (solo da settings menu)  
**Roles:** ORGANIZER  
**Function:** Gestione quote omaggi per PR

#### Metrics:
- **Business Critical:** 9/10 — Revenue feature (recently implemented)
- **User Impact:** 8/10 — ORGANIZER + PR users
- **Isolation Status:** 6/10 — Raggiungibile ma buried deep
- **Implementation Ease:** 8/10 — Aggiungere breadcrumbs e back links

**Priority Score:** `(9×0.4) + (8×0.3) + (6×0.2) + (8×0.1) = 7.6`

#### Why Priority #2:
- Nuova feature critica per business (complimentary system)
- Difficile da raggiungere senza path chiaro
- PR flow dipende da questa pagina

#### Implementation:
```typescript
// Exists: src/app/eventi/[id]/settings/complimentary/page.tsx
// Action: Add breadcrumbs + link from /eventi/[id] hub
// Effort: 15 minutes
```

#### Dependencies:
- Milestone 2: Create `/eventi/[id]/page.tsx` hub first
- Add breadcrumbs component

---

### **#3 — `/lista` (Gestione Liste)**

**Current Status:** 🟡 Partially connected (solo da mobile menu)  
**Roles:** PR, ORGANIZER  
**Function:** Gestione liste ospiti per eventi

#### Metrics:
- **Business Critical:** 8/10 — Core PR workflow
- **User Impact:** 8/10 — PR + ORGANIZER users
- **Isolation Status:** 7/10 — Hard to find on desktop
- **Implementation Ease:** 9/10 — Solo aggiungere sidebar link

**Priority Score:** `(8×0.4) + (8×0.3) + (7×0.2) + (9×0.1) = 7.7`

#### Why Priority #3:
- PR users non trovano questa pagina su desktop
- Gestione liste è workflow quotidiano
- Quick win con sidebar link

#### Implementation:
```typescript
// Exists: src/app/lista/page.tsx
// Action: Add to PR + ORGANIZER sidebar
// Add breadcrumbs
// Effort: 10 minutes
```

#### Dependencies:
- Milestone 1 completed (Sidebar)
- Optional: Create `/liste/[listId]` detail page (M2)

---

### **#4 — `/clienti` (CRM Clienti)**

**Current Status:** 🔴 Completamente isolata  
**Roles:** ORGANIZER  
**Function:** Database clienti e segmentazione

#### Metrics:
- **Business Critical:** 8/10 — Data management core
- **User Impact:** 9/10 — Heavy usage by ORGANIZER
- **Isolation Status:** 10/10 — Zero navigation
- **Implementation Ease:** 9/10 — Solo sidebar link + breadcrumbs

**Priority Score:** `(8×0.4) + (9×0.3) + (10×0.2) + (9×0.1) = 8.4` 🥇 **HIGHEST**

#### Why Priority #4:
- **Actually #1 by score** ma admin più critico per operations
- ORGANIZER usa clienti daily
- Completamente unreachable ora

#### Implementation:
```typescript
// Exists: src/app/clienti/page.tsx
// Action: Add to ORGANIZER sidebar, add breadcrumbs
// Effort: 10 minutes
```

#### Dependencies:
- Milestone 1 completed (Sidebar)
- Breadcrumbs component

---

### **#5 — `/clubs` (Gestione Venues)**

**Current Status:** 🔴 Completamente isolata  
**Roles:** ORGANIZER  
**Function:** Database locali/venues

#### Metrics:
- **Business Critical:** 7/10 — Important but not daily
- **User Impact:** 8/10 — ORGANIZER users
- **Isolation Status:** 10/10 — Zero navigation
- **Implementation Ease:** 9/10 — Solo sidebar link + breadcrumbs

**Priority Score:** `(7×0.4) + (8×0.3) + (10×0.2) + (9×0.1) = 7.9`

#### Why Priority #5:
- Simile a clienti, stesso problema
- Setup venue è step critico per eventi
- Quick win

#### Implementation:
```typescript
// Exists: src/app/clubs/page.tsx
// Action: Add to ORGANIZER sidebar, add breadcrumbs
// Effort: 10 minutes
```

#### Dependencies:
- Milestone 1 completed (Sidebar)

---

### **#6 — `/analytics/general` (Analytics Dashboard)**

**Current Status:** 🔴 Completamente isolata  
**Roles:** ORGANIZER, ADMIN  
**Function:** Analytics e metriche business

#### Metrics:
- **Business Critical:** 8/10 — Decision support critical
- **User Impact:** 7/10 — ORGANIZER + ADMIN
- **Isolation Status:** 10/10 — Zero navigation
- **Implementation Ease:** 9/10 — Solo navbar + sidebar link

**Priority Score:** `(8×0.4) + (7×0.3) + (10×0.2) + (9×0.1) = 8.2`

#### Why Priority #6:
- Decision-making dipende da analytics
- ORGANIZER needs data visibility
- High-value feature nascosta

#### Implementation:
```typescript
// Exists: src/app/analytics/general/page.tsx
// Action: Add to navbar + sidebar (ORGANIZER, ADMIN)
// Effort: 5 minutes
```

#### Dependencies:
- Milestone 1 completed (Navbar + Sidebar)

---

### **#7 — `/dashboard/verifica-identita` (Identity Verification)**

**Current Status:** 🟡 Partially connected (buried in admin)  
**Roles:** ADMIN  
**Function:** Review documenti identità pending

#### Metrics:
- **Business Critical:** 9/10 — Legal/compliance critical
- **User Impact:** 6/10 — Solo ADMIN ma high priority
- **Isolation Status:** 6/10 — Exists but hard to find
- **Implementation Ease:** 8/10 — Highlight in sidebar

**Priority Score:** `(9×0.4) + (6×0.3) + (6×0.2) + (8×0.1) = 7.2`

#### Why Priority #7:
- Compliance requirement (GDPR, age verification)
- Pending verifications potrebbero accumularsi unseen
- Security risk se non accessibile

#### Implementation:
```typescript
// Exists: src/app/dashboard/verifica-identita/page.tsx
// Action: Add prominent link in ADMIN sidebar
// Add badge to navbar (pending count)
// Effort: 20 minutes
```

#### Dependencies:
- Milestone 1 completed
- Badge logic for pending count (optional)

---

### **#8 — `/biglietti` (User Tickets)**

**Current Status:** 🔴 Completamente isolata  
**Roles:** USER  
**Function:** Visualizza biglietti acquistati

#### Metrics:
- **Business Critical:** 6/10 — User-facing but not blocker
- **User Impact:** 9/10 — Every USER needs this
- **Isolation Status:** 10/10 — Users can't find their tickets!
- **Implementation Ease:** 9/10 — Solo sidebar link + mobile nav

**Priority Score:** `(6×0.4) + (9×0.3) + (10×0.2) + (9×0.1) = 7.6`

#### Why Priority #8:
- **CRITICAL UX issue**: users can't see their tickets
- High user impact (all end-users)
- Brand/trust issue se inaccessibile

#### Implementation:
```typescript
// Exists: src/app/biglietti/page.tsx
// Action: Add to USER sidebar + mobile nav prominently
// Add quick link in user menu
// Effort: 10 minutes
```

#### Dependencies:
- Milestone 1 completed
- Ensure USER role has sidebar/mobile nav

---

### **#9 — `/dj/dashboard` (DJ Dashboard)**

**Current Status:** 🔴 Completamente isolata  
**Roles:** DJ  
**Function:** Hub per DJ con performance data

#### Metrics:
- **Business Critical:** 5/10 — Niche role
- **User Impact:** 8/10 — All DJ users
- **Isolation Status:** 10/10 — Zero navigation
- **Implementation Ease:** 9/10 — Solo sidebar link

**Priority Score:** `(5×0.4) + (8×0.3) + (10×0.2) + (9×0.1) = 7.3`

#### Why Priority #9:
- DJ role completamente unable to navigate
- Niche ma 100% impact for that role
- Shows role-based nav working

#### Implementation:
```typescript
// Exists: src/app/dj/dashboard/page.tsx
// Action: Add to DJ sidebar + navbar
// Effort: 5 minutes
```

#### Dependencies:
- Milestone 1 completed
- Create DJ sidebar config in navigation-config.ts

---

### **#10 — `/situa` (Live Event Status)**

**Current Status:** 🟡 Partially connected (da mobile)  
**Roles:** STAFF, ORGANIZER  
**Function:** Status live check-in/porta

#### Metrics:
- **Business Critical:** 7/10 — Operations critical during event
- **User Impact:** 7/10 — STAFF + ORGANIZER
- **Isolation Status:** 6/10 — Mobile only, no desktop
- **Implementation Ease:** 8/10 — Add to sidebar + navbar

**Priority Score:** `(7×0.4) + (7×0.3) + (6×0.2) + (8×0.1) = 6.7`

#### Why Priority #10:
- Critical during live events
- STAFF needs quick access
- Desktop visibility missing

#### Implementation:
```typescript
// Exists: src/app/situa/page.tsx
// Action: Add to STAFF + ORGANIZER sidebar
// Highlight in navbar during active events
// Effort: 15 minutes
```

#### Dependencies:
- Milestone 1 completed
- Optional: badge for "live now" events

---

## 📊 SUMMARY TABLE

| Rank | Page | Score | Status | Effort | Impact | Implementation Order |
|------|------|-------|--------|--------|--------|----------------------|
| **1** | `/clienti` | 8.4 | 🔴 | 10min | Very High | **Phase 1** |
| **2** | `/analytics/general` | 8.2 | 🔴 | 5min | High | **Phase 1** |
| **3** | `/admin` | 8.0 | 🔴 | 5min | Critical | **Phase 1** |
| **4** | `/clubs` | 7.9 | 🔴 | 10min | High | **Phase 1** |
| **5** | `/lista` | 7.7 | 🟡 | 10min | High | **Phase 1** |
| **6** | `/eventi/[id]/settings/complimentary` | 7.6 | 🟡 | 15min | Business Critical | **Phase 2** |
| **7** | `/biglietti` | 7.6 | 🔴 | 10min | Very High Users | **Phase 2** |
| **8** | `/dj/dashboard` | 7.3 | 🔴 | 5min | Medium | **Phase 2** |
| **9** | `/dashboard/verifica-identita` | 7.2 | 🟡 | 20min | Compliance | **Phase 2** |
| **10** | `/situa` | 6.7 | 🟡 | 15min | Operations | **Phase 3** |

---

## 🚀 IMPLEMENTATION PHASES

### **Phase 1: Quick Wins (Week 1, Day 4)** ⚡
**Effort:** ~40 minutes total  
**Impact:** Connect 5 most isolated, high-traffic pages

**Order:**
1. `/admin` — 5min — ADMIN navbar + sidebar
2. `/analytics/general` — 5min — ORGANIZER + ADMIN navbar + sidebar
3. `/clienti` — 10min — ORGANIZER sidebar + breadcrumbs
4. `/clubs` — 10min — ORGANIZER sidebar + breadcrumbs
5. `/lista` — 10min — PR + ORGANIZER sidebar + breadcrumbs

**Acceptance Criteria:**
- [ ] All 5 pages accessible from sidebar for correct roles
- [ ] Breadcrumbs render on clienti, clubs, lista
- [ ] Admin panel has navbar link (global access)

---

### **Phase 2: Critical Flows (Week 2, Day 2)** 🔗
**Effort:** ~60 minutes total  
**Impact:** Complete core user journeys

**Order:**
1. `/eventi/[id]` hub — 30min — CREATE new page + link complimentary
2. `/eventi/[id]/settings/complimentary` — 15min — Add breadcrumbs + back link
3. `/biglietti` — 10min — USER sidebar + mobile nav + user menu
4. `/dj/dashboard` — 5min — DJ sidebar + navbar

**Acceptance Criteria:**
- [ ] Eventi flow navigable: /eventi → [id] → settings/complimentary
- [ ] USER can find biglietti from 3 locations (sidebar, mobile, usermenu)
- [ ] DJ has working dashboard access

---

### **Phase 3: Polish (Week 2, Day 3)** ✨
**Effort:** ~35 minutes total  
**Impact:** Close edge cases and security features

**Order:**
1. `/dashboard/verifica-identita` — 20min — Highlight in ADMIN sidebar + badge
2. `/situa` — 15min — STAFF + ORGANIZER sidebar + live indicator

**Acceptance Criteria:**
- [ ] Pending verifications visible with count badge
- [ ] Situa accessible on desktop for STAFF role

---

## 🎯 ROLE-BASED IMPACT

### By Role:

| Role | Pages Connected | Priority Pages |
|------|-----------------|----------------|
| **ORGANIZER** | 6 | clienti, analytics, clubs, lista, eventi, complimentary |
| **ADMIN** | 3 | admin, analytics, verifica-identita |
| **PR** | 2 | lista, complimentary (indirect) |
| **USER** | 1 | biglietti |
| **DJ** | 1 | dj/dashboard |
| **STAFF** | 1 | situa |
| **VENUE** | 0 | - (low priority pages) |

**Highest Beneficiary:** ORGANIZER (6 critical pages reconnected)

---

## 📈 EXPECTED OUTCOMES

### Metrics Post-Implementation:

**Before:**
- 27 isolated pages (53%)
- 14 connected pages (27%)
- Navigation paths: Minimal

**After Phase 1:**
- 22 isolated pages (43%) — **-10pp**
- 19 connected pages (37%) — **+10pp**

**After Phase 2:**
- 18 isolated pages (35%) — **-18pp total**
- 23 connected pages (45%) — **+18pp total**

**After Phase 3:**
- 16 isolated pages (31%) — **-22pp total**
- 25 connected pages (49%) — **+22pp total**

### Business Impact:
- ✅ Admin operations unblocked
- ✅ ORGANIZER daily workflows accessible
- ✅ PR complimentary system discoverable
- ✅ USER ticket access restored
- ✅ Analytics visibility improved
- ✅ Compliance feature accessible

### UX Impact:
- **Before:** Users memorizing URLs, frustrated navigation
- **After:** Clear menu structure, breadcrumbs, search, role-appropriate

---

## 🔄 CONTINUOUS IMPROVEMENT

### Remaining Isolated Pages (Post Phase 3):

**Low Priority - Future Milestones:**
- `/feed` — Social feature (USER)
- `/u/[username]` — User profiles (USER)
- `/venue/*` — Venue-specific pages (VENUE role)
- `/marketing/*` — Marketing tools (ORGANIZER/ADMIN)
- `/cookie-policy`, `/privacy-policy`, `/terms-of-service` — Legal (footer links)
- `/onboarding/*` — One-time flow (auth redirect)

**Strategy:** Connect incrementally in Milestone 3+ based on usage analytics

---

## ✅ DEFINITION OF DONE

### Page is "Connected" when:
- [ ] Accessible from role-appropriate sidebar/navbar
- [ ] Has breadcrumbs (if applicable)
- [ ] Has back/forward navigation links
- [ ] Searchable via global search (if data-driven)
- [ ] Appears in user testing navigation tasks
- [ ] Analytics show organic traffic (not direct URL access)

### Launch Criteria:
- [ ] All 10 priority pages meet "Connected" definition
- [ ] Zero broken links in navigation
- [ ] All 7 roles tested manually
- [ ] Navigation audit updated with new status
- [ ] Documentation updated with navigation map

---

## 🚨 RISKS & MITIGATION

### Risk 1: User Confusion During Transition
**Impact:** Medium  
**Mitigation:**
- Phased rollout (feature flag per role)
- In-app notifications: "New navigation available"
- Keep old mobile nav until desktop stable

### Risk 2: Performance Regression
**Impact:** Low  
**Mitigation:**
- Lazy load sidebar content
- Memoize navigation config
- Monitor Core Web Vitals

### Risk 3: Missing Pages Break Flow
**Impact:** High (for eventi flow)  
**Mitigation:**
- Prioritize creating `/eventi/[id]` hub in Phase 2
- Fallback: Link directly to complimentary until hub exists

---

## 📚 APPENDIX

### Other Notable Isolated Pages (Not Top 10):

- **Rank 11**: `/checkin` (7.1 score) — Already in mobile nav
- **Rank 12**: `/dashboard/crea-evento` (6.9) — Button in /eventi
- **Rank 13**: `/marketing` (6.5) — Lower usage
- **Rank 14**: `/feed` (5.2) — Social feature, low adoption

### Pages Excluded (Already Connected):
- `/dashboard` ✅ Root hub
- `/auth/*` ✅ Auth flow intact
- `/api/*` ✅ Backend only
- `/test/*` ⚠️ Development only

---

**Status:** Ready for implementation  
**Next Action:** Begin Phase 1 after Milestone 1 completion  
**Owner:** Frontend Tech Lead

