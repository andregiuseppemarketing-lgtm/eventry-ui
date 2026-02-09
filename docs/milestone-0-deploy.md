# Milestone 0 - Deploy Configuration

**Data**: 9 Febbraio 2026  
**Status**: ✅ Repository GitHub ready | ⏳ Vercel deploy pending

---

## Repository GitHub

**URL**: https://github.com/andregiuseppemarketing-lgtm/eventry-ui  
**Branch**: `main`  
**Visibility**: Public  
**Owner**: `andregiuseppemarketing-lgtm`

### Comandi Git Usati

```bash
# Autenticazione GitHub CLI
gh auth login -h github.com -p https -w

# Creazione repository
gh repo create eventry-ui --public \
  --description "Eventry - UI-only project (Next.js 16 + TypeScript + Tailwind)" \
  --source=. --remote=origin

# Commit e push iniziale
git add -A
git commit -m "docs: add setup completion summary"
git push -u origin main
```

### Commit sul Repository

```
f67315f (HEAD -> main, origin/main) docs: add setup completion summary
78d1c21 chore: bootstrap eventry-ui (ui-only)
```

---

## Vercel Deployment - Checklist Click-by-Click

### Step 1: Login e Accesso Dashboard
1. Vai su https://vercel.com
2. Login con account GitHub (`andregiuseppemarketing-lgtm`)
3. Accedi alla Dashboard

### Step 2: Import Project
1. Click su **"Add New..."** → **"Project"**
2. Nella sezione **"Import Git Repository"**:
   - Cerca: `andregiuseppemarketing-lgtm/eventry-ui`
   - Click su **"Import"**

### Step 3: Configure Project
**Project Name**: `eventry-ui` (default OK)

**Framework Preset**: 
- ✅ Verifica che rilevi: **Next.js**
- Se non rileva automaticamente, seleziona manualmente: **Next.js**

**Root Directory**: 
- ✅ Lascia `.` (root del progetto)

**Build Settings**:
- Build Command: `npm run build` (default OK)
- Output Directory: `.next` (default OK)
- Install Command: `npm install` (default OK)

**Environment Variables**:
- ❌ **NON aggiungere nessuna variabile**
- Questo è un progetto UI-only, non richiede env vars

### Step 4: Deploy
1. Click su **"Deploy"**
2. Attendi build (circa 1-2 minuti)
3. Verifica che lo status diventi: ✅ **Ready**

### Step 5: Verifica Deployment
1. Click sul deployment completato
2. Verifica che si apra il sito su URL tipo:
   - `https://eventry-ui.vercel.app` (production)
   - oppure `https://eventry-ui-[hash].vercel.app`
3. Testa le route:
   - `/` - Home marketing
   - `/dashboard` - Dashboard
   - `/events` - Lista eventi
   - `/events/1` - Dettaglio evento

### Step 6: Configurazione Auto-Deploy
1. Vai su **Settings** del progetto
2. Sezione **Git**:
   - ✅ Verifica che sia collegato a: `andregiuseppemarketing-lgtm/eventry-ui`
   - ✅ Production Branch: `main`
3. Sezione **Deployment Protection**:
   - ⚠️ Se c'è "Vercel Authentication", disabilitalo (per ora pubblico)

### Step 7: Test Auto-Deploy
1. Fai una modifica nel codice locale
2. Commit e push su `main`:
   ```bash
   git add -A
   git commit -m "test: trigger vercel deploy"
   git push origin main
   ```
3. Vai su Vercel → **Deployments**
4. Verifica che parta automaticamente un nuovo deployment
5. Attendi completamento e verifica live site

---

## Verifica Post-Deploy

### Checklist Test

- [ ] Homepage (`/`) carica correttamente
- [ ] Dashboard (`/dashboard`) mostra statistiche mock
- [ ] Events list (`/events`) mostra 4 eventi
- [ ] Event detail (`/events/1`) mostra dettaglio evento
- [ ] Design responsive funziona su mobile
- [ ] Nessun errore nella console browser
- [ ] Nessun errore 404 sulle route principali

### Comandi Locali Usati per Verifica

```bash
# Build locale
npm install
npm run build

# Test dev server
npm run dev
# → http://localhost:3000
```

---

## URLs Finali

**GitHub Repository**:  
https://github.com/andregiuseppemarketing-lgtm/eventry-ui

**Vercel Production**:  
`https://eventry-ui.vercel.app` (da verificare dopo deploy)

**Vercel Dashboard**:  
https://vercel.com/[team]/eventry-ui

---

## Note Importanti

### Cosa NON fare
- ❌ Non aggiungere environment variables (non servono)
- ❌ Non collegare database (è UI-only)
- ❌ Non configurare serverless functions (non abbiamo /api routes)
- ❌ Non abilitare analytics (opzionale, per ora skip)

### Troubleshooting

**Se build fallisce**:
1. Verifica che `npm run build` funzioni in locale
2. Controlla Vercel build logs per errori specifici
3. Assicurati che Node version sia compatibile (≥18)

**Se auto-deploy non parte**:
1. Settings → Git → Verifica branch `main` configurato
2. Verifica che GitHub App "Vercel" abbia permessi sul repo
3. Re-connect repository se necessario

**Se pagine 404**:
1. Verifica che route esistano in `src/app/`
2. Check build logs per errori di compilazione
3. Verifica che `.next` build directory sia stata generata

---

## Prossimi Step Dopo Deploy

1. ✅ Verifica che sito sia live
2. ✅ Testa tutte le route
3. ✅ Verifica auto-deploy con un push
4. 🚧 Aggiungere custom domain (opzionale)
5. 🚧 Configurare preview deployments per PR (opzionale)

---

**Ultimo aggiornamento**: 9 Febbraio 2026  
**Status**: Repository pronto, Vercel deploy da eseguire manualmente
