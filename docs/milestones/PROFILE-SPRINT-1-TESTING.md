# 🧪 CHECKLIST TESTING MANUALE - SPRINT 1 PROFILO

**Deployment:** c3d9726  
**Data:** 12 Aprile 2026  
**URL Test:** https://eventry.app/u/[slug]  

---

## ✅ PRE-TEST: PREPARAZIONE AMBIENTE

- [ ] Vercel deployment completato (verde ✓)
- [ ] Browser cache svuotata (Cmd+Shift+R su Mac)
- [ ] DevTools aperto per monitorare console/network
- [ ] Testare su almeno 2 browser (Chrome + Safari/Firefox)
- [ ] Testare mobile + desktop

### Utenti di Test Necessari

**Owner (Proprietario Profilo):**
- [ ] User ID salvato per confronto
- [ ] URL: `/u/[tuo-slug]`

**Visitor (Visitatore):**
- [ ] Logout o modalità incognito
- [ ] URL: `/u/[altro-slug]`

---

## 📱 TEST 1: LAYOUT E STICKY BEHAVIOR

### 1.1 Header Scroll (Desktop + Mobile)

**Azione:** Visitare `/u/[slug]` e scrollare giù lentamente

- [ ] Header scorre normalmente (NO fixed positioning)
- [ ] Avatar 80x80px visibile
- [ ] Nome + badge "Verificato" presente
- [ ] Bio visibile (se presente)
- [ ] Stats (Eventi, Follower, Seguiti) visibili

### 1.2 CTA Bar Sticky (Desktop + Mobile)

**Azione:** Scrollare giù fino a quando header scompare

- [ ] CTA Bar diventa sticky quando header scompare
- [ ] Transition fluida 200ms (NO snap brusco)
- [ ] Background blur applicato (`bg-background/95 backdrop-blur-md`)
- [ ] Shadow apparsa sotto CTA bar
- [ ] Z-index corretto (CTA sopra contenuto)

### 1.3 Tab Bar Sticky (Desktop + Mobile)

**Azione:** Continuare scrolling

- [ ] Tab bar diventa sticky sotto CTA bar
- [ ] Posizione `top-14` (56px da top)
- [ ] Background blur applicato
- [ ] Active tab "Eventi" con underline visibile
- [ ] Tab "Attività" e "Connessioni" hanno badge "Presto"

### 1.4 Scroll Up (Desktop + Mobile)

**Azione:** Scrollare indietro verso l'alto

- [ ] CTA bar torna a posizione normale quando header riappare
- [ ] Tab bar torna a posizione normale
- [ ] Transition fluida in entrambe le direzioni
- [ ] NO layout shift o jump

---

## 👤 TEST 2: CTA BAR - MODALITÀ VISITATORE

**Setup:** Visitare profilo di un altro utente (non owner)

### 2.1 Bottone Segui

- [ ] Visibile e cliccabile
- [ ] Label: "Segui" (se non seguito)
- [ ] Click cambia stato a "Seguendo" con icona fill
- [ ] Variant corretto: default → outline al cambio stato

### 2.2 Bottone Messaggio

**Caso A: Utente HA contatti pubblici (WhatsApp/Telegram)**

- [ ] Bottone "Messaggio" visibile
- [ ] Click apre dropdown menu
- [ ] WhatsApp link presente (se `whatsappNumber` esiste)
- [ ] Telegram link presente (se `telegramHandle` esiste)
- [ ] Click WhatsApp apre `https://wa.me/[number]`
- [ ] Click Telegram apre `https://t.me/[handle]`

**Caso B: Utente NON ha contatti pubblici**

- [ ] Bottone "Messaggio" visibile ma disabled
- [ ] Label: "Presto disponibile" (text-xs)
- [ ] NO dropdown, bottone NON cliccabile
- [ ] Stile disabled corretto (opacità ridotta)

### 2.3 Menu ⋯ (Visitatore)

- [ ] Bottone ⋯ visibile (variant outline, size icon)
- [ ] Click apre dropdown menu
- [ ] Opzioni visibili:
  - [ ] "Condividi Profilo" con icona Share2
  - [ ] "QR Code" con icona QrCode
  - [ ] Separator
  - [ ] "Segnala" con icona Flag (text-destructive)
  - [ ] "Blocca" con icona Ban (text-destructive)

---

## 🔐 TEST 3: CTA BAR - MODALITÀ OWNER

**Setup:** Visitare il proprio profilo `/u/[tuo-slug]`

### 3.1 Bottone Modifica Profilo

- [ ] Visibile come primary button (variant default)
- [ ] Label: "Modifica Profilo"
- [ ] Icona Edit2 presente
- [ ] Link a `/dashboard/settings` funzionante
- [ ] Flex-1 su mobile (full width)

### 3.2 Menu ⋯ (Owner)

- [ ] Bottone ⋯ visibile (variant outline)
- [ ] Click apre dropdown menu
- [ ] Opzioni visibili:
  - [ ] "Condividi Profilo" con icona Share2
  - [ ] "QR Code Personale" con icona QrCode
  - [ ] Separator
  - [ ] "Impostazioni Privacy" (text-muted)
- [ ] **NESSUNA** opzione "Stats" (rimandato Sprint 3)

---

## 📑 TEST 4: TAB NAVIGATION

### 4.1 Tab Bar Rendering

- [ ] 3 tab visibili: Eventi, Attività, Connessioni
- [ ] "Eventi" è attivo di default (underline primary)
- [ ] Icone presenti: Calendar, Target, Users
- [ ] Count badge su "Eventi" (se > 0 eventi)

### 4.2 Tab Stati

**Eventi:**
- [ ] Abilitato (pointer cursor)
- [ ] Hover funzionante (text-foreground)
- [ ] Click attiva tab

**Attività:**
- [ ] Disabled (cursor not-allowed)
- [ ] Opacità 50%
- [ ] Badge "Presto" visibile (variant outline)
- [ ] Click NON attiva tab

**Connessioni:**
- [ ] Disabled (cursor not-allowed)
- [ ] Opacità 50%
- [ ] Badge "Presto" visibile
- [ ] Click NON attiva tab

---

## 📅 TEST 5: TAB EVENTI - EVENTI FUTURI

**Setup:** Utente con almeno 1 evento futuro confermato

### 5.1 Sezione Prossimi Eventi

- [ ] Titolo "Prossimi Eventi" visibile
- [ ] Eventi ordinati per data ASC (più vicini prima)

### 5.2 Event Card Future

**Cover Image:**
- [ ] Se coverUrl presente: immagine caricata (lazy loading)
- [ ] Se coverUrl assente: gradiente fallback visibile
- [ ] Initial letter nel gradiente (se no cover)
- [ ] Altezza 192px (h-48)

**Badge Ticket:**
- [ ] Badge ticketType visibile in alto a destra
- [ ] FREE_LIST → "🎫 Lista Gratuita"
- [ ] DOOR_ONLY → "🎫 Ingresso Cassa"
- [ ] PRE_SALE → "🎫 Prevendita"
- [ ] FULL_TICKET → "🎫 Biglietto"

**Date Block:**
- [ ] Formato: "GIO 15 APR · 23:00" (uppercase)
- [ ] Background accent/10
- [ ] Icona Calendar visibile

**Venue:**
- [ ] Nome venue visibile
- [ ] Città visibile (se presente)
- [ ] Icona MapPin

**Count Registrazioni:**
- [ ] Visibile solo se > 10
- [ ] Formato: "+45 registrati"
- [ ] Icona Users

**CTA Dinamica:**
- [ ] FREE_LIST → "Entra in Lista"
- [ ] DOOR_ONLY → "Info alla Cassa"
- [ ] PRE_SALE → "Prenota Ora"
- [ ] FULL_TICKET → "Acquista Biglietto"
- [ ] Button full width (w-full)
- [ ] Size lg (h-11)

**Click:**
- [ ] Click card → navigate `/eventi/[id]`
- [ ] Click CTA → navigate `/eventi/[id]`

---

## 🗓️ TEST 6: TAB EVENTI - EVENTI PASSATI

**Setup:** Utente con almeno 1 evento passato partecipato

### 6.1 Divider

- [ ] Se ci sono sia futuri che passati: divisore visibile
- [ ] Label "Eventi Passati" centrata
- [ ] Linee border sx/dx presenti

### 6.2 Event Card Past

**Cover Image:**
- [ ] Grayscale 60% applicato
- [ ] Opacity 80%
- [ ] Overlay gradiente visibile
- [ ] Altezza 160px (h-40)

**Badge Partecipato:**
- [ ] "✅ Partecipato" visibile in alto a sinistra
- [ ] Background green-600
- [ ] Variant default

**Date:**
- [ ] Formato semplice: "15 Aprile 2026"
- [ ] Text-xs muted

**Actions:**
- [ ] 2 bottoni visibili: "Foto" + "Condividi"
- [ ] Size sm
- [ ] Variant outline
- [ ] Icone ImageIcon + Share2
- [ ] Flex gap-2 (spazio tra bottoni)

**Click Foto:**
- [ ] Link a `/eventi/[id]#gallery`

---

## 🔄 TEST 7: PAGINAZIONE

**Setup:** Utente con più di 10 eventi totali

### 7.1 Load More Button

- [ ] Visibile se `hasMore = true`
- [ ] Label: "Mostra altri eventi" (NO "Carica altri 10")
- [ ] Min-width 200px
- [ ] Variant outline

### 7.2 Loading State

**Azione:** Click "Mostra altri eventi"

- [ ] Bottone disabilitato durante fetch
- [ ] Spinner animato visibile
- [ ] Label cambia in "Caricamento..."
- [ ] Icona Loader2 con `animate-spin`

### 7.3 Eventi Caricati

- [ ] Nuovi eventi appaiono sotto gli esistenti
- [ ] NO duplicati
- [ ] Ordine corretto mantenuto
- [ ] Bottone scompare se `hasMore = false`

---

## 🚫 TEST 8: EMPTY STATES

### 8.1 Empty State Owner

**Setup:** Proprietario profilo senza eventi

- [ ] Visual gradiente con icona Calendar visibile
- [ ] Titolo: "Inizia la tua avventura"
- [ ] Sottotitolo presente
- [ ] 2 CTA visibili:
  - [ ] "Crea Evento" → `/eventi/nuovo`
  - [ ] "Esplora Eventi" → `/eventi`
- [ ] Layout centrato verticalmente

### 8.2 Empty State Visitatore

**Setup:** Visitatore su profilo senza eventi

- [ ] Visual gradiente con icona Calendar (opacity ridotta)
- [ ] Titolo: "Nessun evento ancora"
- [ ] Sottotitolo presente
- [ ] 1 CTA: "Scopri Eventi" → `/eventi`
- [ ] Layout centrato

---

## ⏳ TEST 9: LOADING STATES

### 9.1 Skeleton Loader

**Azione:** Hard refresh della pagina (Cmd+Shift+R)

- [ ] Skeleton immediato visibile (NO flash bianco)
- [ ] Header "Prossimi Eventi" skeleton
- [ ] 3 event card skeletons visibili
- [ ] Cover skeleton h-48
- [ ] Content skeletons (date, title, venue, CTA)
- [ ] Animazione pulse presente

### 9.2 Fetch Completed

- [ ] Skeleton sostituito con contenuto reale
- [ ] NO layout shift importante
- [ ] Transition fluida da skeleton a content

---

## 📱 TEST 10: RESPONSIVE MOBILE

**Setup:** DevTools responsive mode o device reale (iPhone/Android)

### 10.1 Layout Mobile (< 768px)

**Header:**
- [ ] Avatar 80x80px centrato o sx
- [ ] Nome font-size appropriato
- [ ] Stats in colonna o compatte

**CTA Bar:**
- [ ] Bottoni stacked o flex-1
- [ ] "Segui" e "Messaggio" stesso width
- [ ] Menu ⋯ corretto size

**Tab Bar:**
- [ ] Tab labels leggibili
- [ ] Icons visibili
- [ ] Active indicator visibile
- [ ] No overflow orizzontale

**Event Cards:**
- [ ] Full width
- [ ] Cover aspect ratio corretto
- [ ] Text leggibile (NO font troppo piccolo)
- [ ] CTA full width
- [ ] Padding consistente (px-4)

### 10.2 Tap Targets (Mobile)

- [ ] Tutti i bottoni >= 44px altezza (standard iOS/Android)
- [ ] CTA cards >= 44px
- [ ] Tab bar items >= 44px
- [ ] NO tap overlap tra elementi vicini

---

## 🎨 TEST 11: VISUAL POLISH

### 11.1 Typography

- [ ] Font weights corretti (bold per titoli, semibold per labels)
- [ ] Line-height appropriato (NO text sovrapposizione)
- [ ] Text-muted-foreground per info secondarie
- [ ] Text-primary per elementi attivi

### 11.2 Spacing

- [ ] Padding consistente tra sezioni
- [ ] Gap corretto tra eventi (space-y-4)
- [ ] Margin tra header/cta/tab (NO sovrapposizione)

### 11.3 Colors & Contrast

- [ ] Badge ticketType leggibili
- [ ] Destructive actions (Segnala, Blocca) rossi
- [ ] Success badge (Partecipato) verde
- [ ] Contrast ratio >= 4.5:1 (accessibilità)

### 11.4 Shadows & Borders

- [ ] Card hover shadow presente
- [ ] Border tra sezioni visibile
- [ ] Sticky bars hanno shadow quando attive

---

## 🐛 TEST 12: ERROR HANDLING

### 12.1 Profilo Non Trovato

**Azione:** Visitare `/u/slug-inesistente`

- [ ] 404 page o messaggio errore
- [ ] NO crash app
- [ ] Link navigazione funzionanti

### 12.2 Network Error

**Azione:** DevTools > Network > Offline, hard refresh

- [ ] Error state visibile (NO crash)
- [ ] Messaggio errore chiaro
- [ ] Retry button presente (se implementato)

### 12.3 Eventi API Error

**Azione:** Mock API error 500 (se possibile)

- [ ] Tab Eventi mostra error state
- [ ] NO skeleton infinito
- [ ] Messaggio utente-friendly

---

## 🔍 TEST 13: CONSOLE & NETWORK

### 13.1 Console Errors

**Azione:** Aprire DevTools > Console durante tutti i test

- [ ] **0 errori** JavaScript
- [ ] **0 warning** critici
- [ ] NO memory leaks evidenti

### 13.2 Network Tab

**API Calls:**
- [ ] `GET /api/user/[slug]` → 200 OK
- [ ] `GET /api/user/[slug]/events?page=1` → 200 OK
- [ ] Response times < 1s (se DB locale)
- [ ] NO richieste duplicate
- [ ] NO chiamate non necessarie durante scroll

**Images:**
- [ ] Lazy loading attivo (immagini caricate solo quando visibili)
- [ ] Cover images ottimizzate
- [ ] NO download 4K images per preview

### 13.3 Performance

**Azione:** DevTools > Performance > Record 10s di scrolling

- [ ] Sticky transitions @ 60fps (NO jank)
- [ ] Scroll smooth (NO stutter)
- [ ] Paint times < 16ms
- [ ] NO forced reflow/layout

---

## ✅ ACCEPTANCE CRITERIA FINALI

### Must Have (Sprint 1)

- [ ] Header scroll normale (NO fixed)
- [ ] CTA bar sticky via IntersectionObserver
- [ ] Tab bar sticky sotto CTA
- [ ] Eventi futuri con CTA dinamica
- [ ] Eventi passati con grayscale
- [ ] Empty state curato
- [ ] Loading skeleton immediato
- [ ] Tab "Attività" e "Connessioni" coming soon eleganti
- [ ] Messaggio button gestisce caso senza contatti
- [ ] Owner mode NO Stats drawer
- [ ] Paginazione copy naturale
- [ ] 0 errori TypeScript
- [ ] 0 errori console
- [ ] Mobile responsive

### Nice to Have (Future Sprints)

- ⏳ Micro-filter pills (Sprint 2)
- ⏳ Infinite scroll (Sprint 2)
- ⏳ Highlights section (Sprint 3)
- ⏳ Messaging drawer (Sprint 3)
- ⏳ Stats drawer (Sprint 3)

---

## 📊 RISULTATI TEST

**Data:** ___________  
**Tester:** ___________  
**Browser:** ___________  
**Device:** ___________  

**Test Passati:** ____ / ____  
**Test Falliti:** ____ / ____  

### Bug Trovati

**Priorità Alta:**
1. __________________________________________
2. __________________________________________

**Priorità Media:**
1. __________________________________________
2. __________________________________________

**Priorità Bassa:**
1. __________________________________________

### Note Aggiuntive

__________________________________________
__________________________________________
__________________________________________

---

**FINE TESTING SPRINT 1** ✅
