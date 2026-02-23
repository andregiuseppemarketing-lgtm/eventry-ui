# NextAuth Production Login Debug - Runtime Logs Analysis

**Approccio**: Debug deterministico basato su dati reali dai log di produzione.  
**Obiettivo**: Identificare esatta causa del fallimento login prima di modificare codice.

---

## 1. ACCESSO AI RUNTIME LOGS (Vercel)

### Passo 1: Accedi ai log del deployment corrente
```
1. Vai su https://vercel.com/[tuo-team]/eventry-ui
2. Click "Deployments" nella sidebar
3. Trova il deployment con dominio "www.eventry.app" (Production)
4. Click sul deployment
5. Click tab "Runtime Logs" in alto
```

### Passo 2: Configura il filtro
```
- Imposta "Live" o "Last 1 hour" nel selettore temporale
- Lascia filtri vuoti per ora (vedremo tutto)
```

---

## 2. TEST CON MONITORAGGIO

### Esegui login con osservazione parallela

**In una finestra**: Runtime Logs aperto (auto-refresh ON)  
**In un'altra finestra**: https://www.eventry.app/auth/login

```
Email: admin@eventry.app
Password: admin123
```

**Clicca "Login"** e osserva i log in tempo reale.

---

## 3. MATRICE DIAGNOSTICA

Cerca questi pattern **esatti** nei log. Ogni pattern indica una causa specifica.

### Pattern A: `[Auth] Validation failed`
```log
[Auth] Validation failed: { email: ... }
```

**Causa**: LoginSchema rifiuta i dati del form  
**Validazioni**: 
- Email deve essere formato email valido (z.string().email())
- Password deve avere almeno 1 carattere (z.string().min(1))

**Possibili problemi**:
- Form invia `username` invece di `email`
- Form invia campo vuoto
- Encoding problemi (spazi, caratteri speciali)

**Fix immediato**: Verifica payload inviato dal form con Chrome DevTools → Network → Payload

---

### Pattern B: `[Auth] Attempting login for: admin@eventry.app`  
          `[Auth] User not found: admin@eventry.app`

```log
[Auth] Attempting login for: admin@eventry.app
[Auth] User not found: admin@eventry.app
```

**Causa**: Prisma query `findUnique({ where: { email } })` ritorna `null`

**Possibili problemi**:
1. DATABASE_URL punta a DB sbagliato (non Neon corretto)
2. Prisma non connette (connection pool error)
3. Email case-sensitivity (es. "Admin@eventry.app" vs "admin@eventry.app")
4. User effettivamente non esiste in quel DB

**Cosa sappiamo GIÀ**:
- ✅ User esiste su Neon (ID: cmlcgl0hn0000lwe9sghclvuy)
- ✅ Email è esattamente "admin@eventry.app" (case-sensitive OK)

**Se vedi questo log → DATABASE_URL punta a DB sbagliato!**

**Fix immediato**: 
```bash
# Verifica DATABASE_URL su Vercel
1. Vai su Project Settings → Environment Variables
2. Cerca "DATABASE_URL" per Production
3. Confronta con connection string Neon corretto
4. Se diverso: aggiorna e fai redeploy
```

---

### Pattern C: `[Auth] Attempting login for: admin@eventry.app`  
          `[Auth] Invalid password for: admin@eventry.app`

```log
[Auth] Attempting login for: admin@eventry.app
[Auth] Invalid password for: admin@eventry.app
```

**Causa**: bcrypt.compare() ritorna `false`

**Possibili problemi**:
1. Password hash in DB non corrisponde a "admin123"
2. bcryptjs ha problemi (molto improbabile)

**Cosa sappiamo GIÀ**:
- ✅ Password hash verificato con script check-admin-pwd.js
- ✅ Hash corrisponde a "admin123"

**Se vedi questo log → qualcosa di molto strano (hash cambiato?)**

**Fix immediato**:
```bash
# Reset password admin
node src/scripts/create-production-admin.mjs
# (lo script aggiorna se user esiste)
```

---

### Pattern D: `[Auth] Error during authorization: Error: ...`

```log
[Auth] Error during authorization: Error: ...
```

**Causa**: Eccezione nel blocco try-catch (linea 81 di auth.ts)

**Possibili problemi**:
1. Prisma connection error (DB unreachable)
2. bcryptjs import error
3. Environment variable missing (NEXTAUTH_SECRET)
4. Timeout Prisma query

**Fix dipende dall'errore specifico**:
- Se "Prisma Client not initialized" → verifica build include Prisma binaries
- Se "connect ETIMEDOUT" → verifica DATABASE_URL e Neon status
- Se "JWE encryption failed" → verifica NEXTAUTH_SECRET esiste

**Fix immediato**: Copia messaggio errore completo e analizza

---

### Pattern E: **NESSUN LOG "[Auth]" appare**

```log
(silenzio totale, nessuna traccia di [Auth])
```

**Causa**: NextAuth non invoca l'authorize() function

**Possibili problemi**:
1. **NEXTAUTH_URL domain mismatch** (teoria principale)
   - Variabile env = `https://eventry-ui-xxx.vercel.app`
   - Richiesta da = `https://www.eventry.app`
   - NextAuth rifiuta silenziosamente per CSRF protection

2. JWT verification fallisce in route handler
3. Request non raggiunge l'API route

**Cosa sappiamo GIÀ**:
- Route.ts linee 5-11 hanno conditional buggy
- Se NEXTAUTH_URL esiste con valore sbagliato, non viene overridden

**Se vedi questo → CONFERMA ipotesi domain mismatch!**

**Fix immediato**:
```bash
# Opzione 1: Fix environment variable
Vercel Dashboard → Settings → Environment Variables → Production
NEXTAUTH_URL = https://www.eventry.app

# Opzione 2: Merge PR fix/nextauth-production-login
git checkout main
git merge fix/nextauth-production-login
git push origin main
```

---

## 4. LOG AGGIUNTIVI DA CONTROLLARE

### NextAuth Internal Logs
Se abiliti debug mode, NextAuth mostra più dettagli:

```typescript
// src/lib/auth.ts
export const authConfig = {
  debug: true, // <-- aggiungi questa riga temporaneamente
  session: { strategy: "jwt" as const },
  // ...
}
```

Con `debug: true` vedrai:
```log
[next-auth][debug] session()
[next-auth][debug] JWT
[next-auth][error] JWT_SESSION_ERROR
```

### Prisma Query Logs
Se abiliti Prisma logging:

```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  log = ["query", "error"]
}
```

Vedrai le query SQL effettive.

---

## 5. DECISION TREE

```
Login attempt → Runtime Logs
    ├─ Pattern A (Validation failed)
    │   └─ Fix: Controlla payload form
    │
    ├─ Pattern B (User not found)
    │   └─ Fix: Verifica DATABASE_URL su Vercel
    │
    ├─ Pattern C (Invalid password)
    │   └─ Fix: Reset password con script
    │
    ├─ Pattern D (Error during authorization)
    │   └─ Fix: Analizza stack trace
    │
    └─ Pattern E (NESSUN LOG)
        └─ Fix: NEXTAUTH_URL domain mismatch
            ├─ Opzione 1: Aggiorna env var
            └─ Opzione 2: Merge fix branch
```

---

## 6. CHECKLIST POST-LOG ANALYSIS

Dopo aver identificato il pattern:

- [ ] Screenshot log con timestamp
- [ ] Copia messaggio errore completo (se presente)
- [ ] Verifica env vars su Vercel Dashboard
- [ ] Applica fix minimo specifico per il pattern
- [ ] Trigger redeploy (se cambiate env vars)
- [ ] Re-test login
- [ ] Conferma cookies domain (Chrome DevTools → Application → Cookies)

---

## 7. COOKIE DEBUG (se Pattern E confermato)

Se NextAuth rifiuta silenziosamente per domain mismatch:

```bash
# Chrome DevTools dopo tentativo login
1. F12 → Application tab
2. Cookies → https://www.eventry.app
3. Cerca: next-auth.session-token

ATTESO: Cookie con domain=www.eventry.app
SE MANCA: NextAuth non ha creato sessione (conferma domain mismatch)
```

**Verifica anche**:
```bash
# Network tab durante login
1. F12 → Network
2. POST /api/auth/callback/credentials
3. Response Headers → Set-Cookie

ATTESO: Set-Cookie: next-auth.session-token=...; Domain=www.eventry.app
SE DIVERSO: Domain sbagliato
```

---

## 8. COMANDI RAPIDI

### Verifica DATABASE_URL su Vercel
```bash
vercel env ls production
# Cerca DATABASE_URL
```

### Verifica NEXTAUTH_URL su Vercel
```bash
vercel env ls production
# Cerca NEXTAUTH_URL
```

### Reset password admin (se Pattern C)
```bash
cd /Users/andreagranata/Desktop/APP/eventry-ui
node src/scripts/create-production-admin.mjs
```

### Merge fix branch (se Pattern E)
```bash
git checkout main
git merge fix/nextauth-production-login
git push origin main
# Vercel auto-deploya
```

---

## 9. PRIORITÀ

**ORA**: 
1. Accedi a Vercel Runtime Logs
2. Esegui login test
3. Identifica quale Pattern (A/B/C/D/E) appare
4. Riporta qui il pattern esatto

**POI** (dopo conferma pattern):
- Applicheremo fix minimo specifico
- Niente merge di PR se non necessario
- Niente modifica codice se è solo env var

---

## NEXT STEP

**Eseguire login con Log aperti e riportare quale pattern appare.**

```bash
# Summary comandi preparatori
cd /Users/andreagranata/Desktop/APP/eventry-ui

# Se serve debug mode (opzionale):
# Aggiungi `debug: true` in src/lib/auth.ts → authConfig
# git commit, git push → attendi redeploy

# Poi: Vercel → Deployments → www.eventry.app → Runtime Logs → Test login
```

**Attendo report del pattern visualizzato nei log.**
