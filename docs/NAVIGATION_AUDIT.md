# 🔍 EVENTRY - Audit Completo Navigazione e Architettura

**Data:** 9 marzo 2026  
**Analisi di:** Product Architect + UX Lead + Frontend Tech Lead

---

## TASK 1 — AUDIT PAGINE ESISTENTI

### 📊 Tabella Completa Pagine (51 pagine UI)

| # | Pagina | Ruoli Required | Funzione Principale | Parent Section | Collegamenti IN | Collegamenti OUT | Stato |
|---|--------|----------------|---------------------|----------------|-----------------|------------------|-------|
| **🏠 HOMEPAGE & PUBLIC** |
| 1 | `/` | PUBLIC | Landing page + Hero | N/A | Diretta | Login, Register, Eventi | ⚠️ ISOLATA |
| 2 | `/feed` | AUTHENTICATED | Feed social eventi | Dashboard | Navbar?, MobileNav? | Eventi, Profili | ⚠️ ISOLATA |
| 3 | `/u/[slug]` | PUBLIC | Profilo utente pubblico | Feed | Feed | Follow, Eventi | ⚠️ ISOLATA |
| 4 | `/org/[slug]` | PUBLIC | Profilo organizzazione | Venues/Eventi | Search, Eventi | Team, Eventi, Venues | ⚠️ ISOLATA |
| 5 | `/venue/[slug]` | PUBLIC | Profilo venue/club | Clubs | Search, Clubs | Eventi, Gallery | ⚠️ ISOLATA |
| **🔐 AUTENTICAZIONE** |
| 6 | `/auth/login` | PUBLIC | Login utente | N/A | Homepage, Logout | Dashboard (redirect) | ✅ CONNESSA |
| 7 | `/auth/register` | PUBLIC | Registrazione | Homepage | Homepage | Onboarding Step 2 | ✅ CONNESSA |
| 8 | `/auth/forgot-password` | PUBLIC | Recupero password | Login | Login | Reset password | ✅ CONNESSA |
| 9 | `/auth/reset-password` | PUBLIC | Reset password form | Email | Email link | Login | ✅ CONNESSA |
| 10 | `/auth/verify-email` | PUBLIC | Verifica email | Email | Email link | Dashboard | ✅ CONNESSA |
| 11 | `/auth/verify-email-sent` | PUBLIC | Conferma invio email | Register | Register | N/A | ✅ CONNESSA |
| 12 | `/auth/error` | PUBLIC | Errori auth | NextAuth | Auth flows | Login | ✅ CONNESSA |
| **👤 ONBOARDING** |
| 13 | `/onboarding/step-2` | AUTHENTICATED | Scelta ruolo/tipo account | Register | Register redirect | Step 3 | ✅ CONNESSA |
| 14 | `/onboarding/step-3` | AUTHENTICATED | Creazione profilo completo | Step 2 | Step 2 | Dashboard | ✅ CONNESSA |
| **📊 DASHBOARD PRINCIPALE** |
| 15 | `/dashboard` | AUTHENTICATED | Hub centrale, cards stats | Login redirect | Login, Navbar | Eventi, Biglietti, Analytics | ✅ CONNESSA |
| 16 | `/dashboard/profilo` | AUTHENTICATED | Gestione profilo personale | Dashboard | Sidebar?, UserNav | Settings | ⚠️ PARZIALE |
| 17 | `/dashboard/settings` | AUTHENTICATED | Impostazioni account | Dashboard | UserNav, Sidebar | Profilo | ✅ CONNESSA |
| 18 | `/dashboard/tickets` | AUTHENTICATED | Gestione biglietti utente | Dashboard | Dashboard card | Ticket detail | ⚠️ ISOLATA |
| 19 | `/dashboard/checkin` | STAFF, ORGANIZER, ADMIN | Check-in dashboard | Dashboard | Sidebar?, MobileNav? | Scanner | ⚠️ ISOLATA |
| 20 | `/dashboard/analytics` | AUTHENTICATED | Analytics dashboard | Dashboard | Dashboard card | Eventi analytics | ⚠️ ISOLATA |
| 21 | `/dashboard/marketing` | ADMIN | Marketing tools | Dashboard | Sidebar (ADMIN) | Funnel | ⚠️ ISOLATA |
| 22 | `/dashboard/admin` | ADMIN | Admin dashboard | Dashboard | Sidebar (ADMIN) | Admin sections | ⚠️ ISOLATA |
| 23 | `/dashboard/verifica-identita` | ADMIN | Review identità (batch) | Dashboard | Sidebar (ADMIN) | N/A | ⚠️ ISOLATA |
| **👥 ADMIN PANEL** |
| 24 | `/admin` | ADMIN | Admin homepage | Dashboard | Navbar, Sidebar | Admin sections | ⚠️ ISOLATA |
| 25 | `/admin/users` | ADMIN | Gestione utenti | Admin | Admin sidebar | User detail | ⚠️ ISOLATA |
| 26 | `/admin/events` | ADMIN | Gestione eventi globale | Admin | Admin sidebar | Event detail | ⚠️ ISOLATA |
| 27 | `/admin/tickets` | ADMIN | Gestione biglietti globale | Admin | Admin sidebar | Ticket detail | ⚠️ ISOLATA |
| 28 | `/admin/emails` | ADMIN | Log email inviate | Admin | Admin sidebar | N/A | ⚠️ ISOLATA |
| 29 | `/admin/system` | ADMIN | Sistema e configurazione | Admin | Admin sidebar | N/A | ⚠️ ISOLATA |
| **🎉 EVENTI** |
| 30 | `/eventi/nuovo` | ORGANIZER, ADMIN | Creazione nuovo evento | Dashboard | Dashboard CTA, Sidebar | Eventi detail | ⚠️ PARZIALE |
| 31 | `/eventi/[id]/checkout` | PUBLIC | Checkout biglietto evento | Evento pubblico | Link evento | Payment | ⚠️ ISOLATA |
| 32 | `/eventi/[id]/consumazioni` | ADMIN, ORGANIZER, STAFF | Gestione consumazioni bar | Evento | Sidebar evento | N/A | ⚠️ ISOLATA |
| 33 | `/eventi/[id]/settings/complimentary` | ORGANIZER, ADMIN | **Gestione quote omaggi** | Evento settings | Settings CTA | PR quota | ⚠️ PARZIALE |
| **🎟️ BIGLIETTI & CHECK-IN** |
| 34 | `/biglietti` | AUTHENTICATED | Elenco biglietti utente | Dashboard | MobileNav, Navbar | Ticket QR | ⚠️ PARZIALE |
| 35 | `/checkin` | STAFF, ORGANIZER, ADMIN, PR | Scanner QR check-in | Dashboard | MobileNav, Navbar | Ticket detail | ✅ CONNESSA |
| **📋 LISTE & CLIENTI** |
| 36 | `/lista` | ORGANIZER, ADMIN, PR | Gestione liste ingresso | Dashboard | Sidebar | Entry detail | ⚠️ ISOLATA |
| 37 | `/clienti` | ORGANIZER, ADMIN | Elenco clienti/guest | Dashboard | Sidebar | Cliente detail | ⚠️ ISOLATA |
| 38 | `/clienti/[id]` | ORGANIZER, ADMIN | Dettaglio singolo cliente | Clienti list | Clienti list | Tickets, Eventi | ✅ CONNESSA |
| **🏢 LOCALI & CLUB** |
| 39 | `/clubs` | ORGANIZER, ADMIN | Elenco clubs/locali | Dashboard | Sidebar | Club detail | ⚠️ ISOLATA |
| 40 | `/clubs/[id]` | ORGANIZER, ADMIN | Dettaglio club | Clubs list | Clubs list | Eventi, Team | ✅ CONNESSA |
| **📈 ANALYTICS** |
| 41 | `/analytics/general` | ORGANIZER, ADMIN | Analytics generali | Dashboard | Sidebar | Per-event analytics | ⚠️ ISOLATA |
| 42 | `/analytics/[eventId]` | ORGANIZER, ADMIN | Analytics per evento | General analytics | Eventi detail | N/A | ⚠️ ISOLATA |
| **🛠️ MARKETING & TRACKING** |
| 43 | `/marketing/funnel` | ADMIN, ORGANIZER | Analytics funnel conversione | Dashboard | Dashboard marketing | N/A | ⚠️ ISOLATA |
| 44 | `/situa` | AUTHENTICATED | Status/situazione live eventi | Dashboard | Sidebar?, Quick link | Eventi detail | ⚠️ ISOLATA |
| **🎵 DJ/ARTIST** |
| 45 | `/dj/dashboard` | DJ | Dashboard DJ/Artisti | Dashboard | Navbar, Sidebar (DJ) | Performances | ⚠️ ISOLATA |
| **🔒 IDENTITÀ** |
| 46 | `/verifica-identita` | AUTHENTICATED | Upload documenti identità | Dashboard | Modal, Sidebar | Dashboard | ⚠️ PARZIALE |
| **👤 USER AREA** |
| 47 | `/user/profilo` | AUTHENTICATED | Profilo utente (alt) | Dashboard | ??? | Settings | ❌ RIDONDANTE |
| **⚖️ LEGALE & POLICY** |
| 48 | `/privacy-policy` | PUBLIC | Informativa privacy | Footer | Footer | N/A | ✅ CONNESSA |
| 49 | `/cookie-policy` | PUBLIC | Policy cookies | Footer, Banner | Banner, Footer | N/A | ✅ CONNESSA |
| 50 | `/terms-of-service` | PUBLIC | Termini di servizio | Footer | Footer, Register | N/A | ✅ CONNESSA |
| 51 | `/gdpr` | AUTHENTICATED | Gestione consensi GDPR | Settings | Settings | N/A | ✅ CONNESSA |
| **🧪 DEBUG** |
| 52 | `/test` | DEV | Pagina di test | N/A | Diretta | N/A | ✅ DEV ONLY |
| 53 | `/unauthorized` | ALL | Accesso negato | Middleware | Auth failures | Login | ✅ CONNESSA |

---

## 📊 ANALISI STATO COLLEGAMENTI

### ✅ CONNESSE (14 pagine) - 26%
Pagine con collegamenti in entrata E uscita ben definiti:
- Auth flow completo (7 pagine)
- Onboarding (2 pagine)
- Dashboard hub (1)
- Check-in (1)
- Dettaglio cliente/club (2)
- Policy/Legal (3)

### ⚠️ PARZIALMENTE CONNESSE (8 pagine) - 15%
Pagine con alcuni collegamenti ma navigazione incompleta:
- `/biglietti` - manca sidebar link
- `/dashboard/profilo` - manca sidebar
- `/eventi/nuovo` - link parziale da dashboard
- `/eventi/[id]/settings/complimentary` - manca breadcrumb, sidebar
- `/verifica-identita` - solo da modal

### ❌ ISOLATE (27 pagine) - 51%
Pagine **senza collegamenti chiari** da navbar/sidebar:
- Feed e profili pubblici (4)
- Dashboard secondarie (5)
- Admin panel completo (6)
- Eventi detail/settings (2)
- Liste e clienti (2)
- Clubs (1)
- Analytics (2)
- Marketing/Funnel (2)
- DJ dashboard (1)
- Situa (1)
- User/profilo alternativo (1)

### 🔁 RIDONDANTI (2 pagine) - 4%
Pagine duplicate da consolidare:
- `/dashboard/profilo` vs `/user/profilo` (stessa funzione)

---

## 🎯 ANALISI FLUSSI CORE

### **FLUSSO 1: EVENTI → GESTIONE → ANALYTICS**

#### ✅ Esistenti:
- `/eventi/nuovo` - Creazione
- `/eventi/[id]/settings/complimentary` - Quote omaggi
- `/eventi/[id]/consumazioni` - Gestione bar
- `/analytics/[eventId]` - Analytics specifico

#### ❌ MANCANTI:
- `/eventi` - Lista eventi ORGANIZER (esiste solo API)
- `/eventi/[id]` - Dettaglio evento (hub centrale)
- `/eventi/[id]/settings` - Settings hub
- `/eventi/[id]/liste` - Gestione liste
- `/eventi/[id]/tickets` - Biglietti venduti

#### **Collegamenti Proposti:**
```
Dashboard
  └─→ [Vai a Eventi] 
        └─→ /eventi (lista)
              ├─→ /eventi/nuovo [+ Crea Evento]
              └─→ /eventi/[id] (detail hub)
                    ├─→ /eventi/[id]/settings
                    │     ├─→ complimentary
                    │     ├─→ tickets
                    │     └─→ general
                    ├─→ /eventi/[id]/liste
                    ├─→ /eventi/[id]/check-in
                    ├─→ /eventi/[id]/consumazioni
                    └─→ /analytics/[eventId]
```

---

### **FLUSSO 2: CHECK-IN / PORTA → SCANNER → PAGAMENTO**

#### ✅ Esistenti:
- `/checkin` - Scanner principale
- `/dashboard/checkin` - Dashboard check-in

#### ❌ MANCANTI:
- `/checkin/manual` - Check-in manuale
- `/checkin/payment` - Pagamento porta
- Porta flow unificato (ARRIVED → ADMITTED gates)

#### **Collegamenti Proposti:**
```
MobileNav/Navbar
  └─→ [Check-in]
        └─→ /checkin
              ├─→ Scanner QR (auto check-in)
              ├─→ Manual Search (cerca per nome)
              ├─→ Payment at Door (se DOOR_ONLY ticket)
              └─→ Stats Dashboard (/dashboard/checkin)
```

---

### **FLUSSO 3: PR / OMAGGI / LISTE**

#### ✅ Esistenti:
- `/eventi/[id]/settings/complimentary` - Quota management
- `/lista` - Liste
- API: `/api/pr/[prId]/complimentary-quota`
- API: `/api/tickets/issue` (complimentary)

#### ❌ MANCANTI:
- `/pr/dashboard` - Dashboard PR specifico
- `/pr/omaggi` - Lista omaggi disponibili per PR
- `/pr/assegna` - Flow assegnazione omaggio
- `/liste/[listId]` - Dettaglio lista singola

#### **Collegamenti Proposti:**
```
Dashboard (PR role)
  └─→ [I Miei Omaggi]
        └─→ /pr/omaggi
              ├─→ Eventi con quota disponibile
              ├─→ [Assegna Omaggio]
              │     └─→ Form: evento, guest, quota check
              └─→ Storico assegnazioni
              
Sidebar (PR role)
  └─→ [Le Mie Liste]
        └─→ /lista
              └─→ /liste/[listId]
                    ├─→ Entries
                    ├─→ Check-in status
                    └─→ [Emetti Biglietto]
```

---

### **FLUSSO 4: ADMIN / ORGANIZZAZIONE**

#### ✅ Esistenti:
- `/admin` - Homepage
- `/admin/users` - Gestione utenti
- `/admin/events` - Eventi
- `/admin/tickets` - Biglietti
- `/admin/emails` - Log email
- `/admin/system` - Sistema
- `/dashboard/admin` - Admin dashboard (?)
- `/dashboard/verifica-identita` - Batch review identità

#### ❌ Collegamenti:
- Nessun link da navbar
- Admin isolato completamente

#### **Collegamenti Proposti:**
```
Navbar (ADMIN role)
  └─→ [Admin Panel]
        └─→ /admin
              ├─→ Users Management
              ├─→ Events Management
              ├─→ Tickets Overview
              ├─→ Email Logs
              ├─→ Identity Verification
              └─→ System Config
```

---

## 🔍 PAGINE RIDONDANTI DA CONSOLIDARE

### 1. Profilo Utente (2 pagine duplicate)
- `/dashboard/profilo`
- `/user/profilo`

**Decisione:** Mantenere `/dashboard/profilo` come principale. Redirect `/user/profilo` → `/dashboard/profilo`.

### 2. Check-in (2 pagine simili)
- `/checkin` - Scanner operativo
- `/dashboard/checkin` - Dashboard stats

**Decisione:** Mantenere entrambe. `/checkin` = action page. `/dashboard/checkin` = analytics. Collegare con tab/link.

### 3. Admin Dashboard (2 entry points)
- `/admin` - Admin panel
- `/dashboard/admin` - Admin dashboard

**Decisione:** Consolidare. `/admin` come hub principale. Redirect `/dashboard/admin` → `/admin`.

---

## 🎨 PAGINE CHE NECESSITANO PARENT HUB

### Eventi (serve `/eventi` lista)
Attualmente:
- `/eventi/nuovo` - esiste
- `/eventi/[id]/*` - esiste parziale

Serve:
- `/eventi` - Lista eventi organizer
- `/eventi/[id]` - Hub dettaglio evento

### Liste (serve hub)
Attualmente:
- `/lista` - lista generica

Serve:
- `/liste/[listId]` - Dettaglio lista singola

### PR (serve dashboard dedicato)
Attualmente:
- Nessuna pagina PR specifica

Serve:
- `/pr/dashboard` - Hub PR
- `/pr/omaggi` - Quota view

---

## 📊 STATISTICHE FINALI

| Metrica | Valore | % |
|---------|--------|---|
| **Totale pagine** | 51 | 100% |
| **Connesse** | 14 | 27% |
| **Parziali** | 8 | 16% |
| **Isolate** | 27 | 53% |
| **Ridondanti** | 2 | 4% |

### 🚨 PRIORITÀ CRITICHE

**Top 10 Pagine da Collegare Subito:**
1. `/admin` - Admin panel hub (ADMIN)
2. `/eventi/[id]/settings/complimentary` - Quote omaggi (ORGANIZER)
3. `/lista` - Gestione liste (PR/ORGANIZER)
4. `/clienti` - CRM clienti (ORGANIZER)
5. `/clubs` - Gestione venues (ORGANIZER)
6. `/analytics/general` - Analytics (ORGANIZER/ADMIN)
7. `/dashboard/verifica-identita` - Identity review (ADMIN)
8. `/biglietti` - I miei biglietti (USER)
9. `/dj/dashboard` - Dashboard DJ (DJ)
10. `/situa` - Status live eventi (STAFF)

**Pagine Secondarie** (possono attendere):
- Feed e profili pubblici (utente finale)
- Marketing/Funnel (analytics avanzato)
- `/eventi/[id]/consumazioni` (feature locale-specifica)
- Test/Debug pages
