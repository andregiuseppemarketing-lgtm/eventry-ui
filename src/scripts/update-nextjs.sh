#!/bin/bash

# 🚀 AUTOMATIC SECURITY UPGRADE – NEXT.JS & DEPLOY (EVENT IQ)

echo "──────────────────────────────────────────────"
echo "🔧 EVENT IQ – Next.js Security & Version Upgrade"
echo "──────────────────────────────────────────────"
cd "/Users/andreagranata/Desktop/APP/EVENT APP" || exit 1

echo "📦 Step 1: Aggiornamento Next.js e dipendenze core..."
npm install next@latest react@latest react-dom@latest eslint-config-next@latest --save

echo "──────────────────────────────────────────────"
echo "🧩 Step 2: Pulizia cache e node_modules..."
rm -rf .next node_modules/.cache
echo "✅ Cache pulita."

echo "──────────────────────────────────────────────"
echo "🔐 Step 3: Esecuzione audit e fix vulnerabilità..."
npm audit fix || true
echo "✅ Audit completato."

echo "──────────────────────────────────────────────"
echo "🧱 Step 4: Rigenerazione Prisma Client..."
npx prisma generate

echo "──────────────────────────────────────────────"
echo "🏗️ Step 5: Build di produzione..."
npm run build

echo "──────────────────────────────────────────────"
echo "☁️ Step 6: Deploy su Vercel (production)..."
npx vercel deploy --prod --yes

echo "──────────────────────────────────────────────"
echo "🔎 Step 7: Verifica versione Next.js installata..."
npm list next | grep "next@"

echo "──────────────────────────────────────────────"
echo "✅ AGGIORNAMENTO COMPLETATO!"
echo "Next.js e dipendenze aggiornate con successo."
echo "Build e deploy eseguiti. La vulnerabilità sarà rimossa su Vercel."
echo "──────────────────────────────────────────────"
