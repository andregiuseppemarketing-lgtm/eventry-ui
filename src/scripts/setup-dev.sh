#!/bin/bash

# Setup script per ambiente di sviluppo locale

echo "🚀 Setup ambiente di sviluppo PANICO APP..."

# 1. Copia .env.local se non esiste
if [ ! -f .env.local ]; then
  echo "📝 Creazione .env.local..."
  cp .env.local.example .env.local 2>/dev/null || echo "Usa .env.local esistente"
fi

# 2. Installa dipendenze
echo "📦 Installazione dipendenze..."
npm install

# 3. Configura database locale SQLite
echo "🗄️  Setup database locale (SQLite)..."

# Backup temporaneo dello schema per PostgreSQL
cp prisma/schema.prisma prisma/schema.prisma.production

# Crea schema temporaneo per SQLite
cat > prisma/schema.prisma.dev << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
EOF

# Appendi il resto dello schema (dalla riga 13 in poi)
tail -n +13 prisma/schema.prisma.production >> prisma/schema.prisma.dev

# Sostituisci lo schema
mv prisma/schema.prisma.dev prisma/schema.prisma

# 4. Genera client Prisma
echo "🔧 Generazione Prisma Client..."
npx prisma generate

# 5. Esegui migrazioni
if [ ! -f prisma/dev.db ]; then
  echo "🏗️  Creazione database e migrazioni..."
  npx prisma migrate dev --name init
else
  echo "✅ Database esistente trovato"
fi

# Ripristina schema PostgreSQL per production
mv prisma/schema.prisma.production prisma/schema.prisma
npx prisma generate

echo ""
echo "✅ Setup completato!"
echo ""
echo "📋 Prossimi passi:"
echo "1. Configura le variabili in .env.local"
echo "2. Avvia il server: npm run dev"
echo "3. Apri http://localhost:3000"
echo ""
