# Milestone 0 - Setup Progetto

**Data**: 9 Febbraio 2026  
**Status**: ✅ Completato

## Obiettivo

Bootstrap di un progetto Next.js pulito e UI-only, senza backend/auth/db/email.

## Struttura Creata

```
eventry-ui/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx       # Home marketing
│   │   │   └── layout.tsx
│   │   └── (app)/
│   │       ├── layout.tsx     # Layout con sidebar
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       └── events/
│   │           ├── page.tsx
│   │           └── [id]/
│   │               └── page.tsx
│   ├── components/            # (vuota, pronta)
│   └── data/
│       ├── mock-events.ts
│       └── mock-stats.ts
└── docs/
    ├── milestone-0-setup.md
    └── milestone-1-ui.md
```

## Stack

- **Next.js**: 16.1.6 (App Router)
- **React**: 19.x
- **TypeScript**: Latest
- **Tailwind CSS**: Latest
- **ESLint**: Latest

## Cosa NON è presente (intenzionale)

❌ Prisma  
❌ next-auth  
❌ Resend / email  
❌ API routes  
❌ Variabili d'ambiente richieste  
❌ GitHub Actions per deploy  
❌ Configurazioni Vercel

## Comandi Disponibili

```bash
npm run dev       # Avvia dev server
npm run build     # Build produzione
npm run lint      # ESLint check
```

## Prossimi Passi

1. Milestone 1: Completare UI base con componenti riutilizzabili
2. Milestone 2: Aggiungere navigazione e routing completo
3. Milestone 3: Integrare backend (separatamente)
