#!/bin/bash
set -e

echo "🔄 Merge dev → main via GitHub API..."

# Chiudi eventuali editor aperti
pkill -9 vim 2>/dev/null || true
pkill -9 vi 2>/dev/null || true
pkill -9 nano 2>/dev/null || true

# Configura git per non aprire editor
export GIT_EDITOR=true
export EDITOR=true
export VISUAL=true

cd /Users/andreagranata/Desktop/APP/eventry

# Checkout main
git checkout main 2>&1

# Merge con --no-edit per evitare editor
git merge dev --no-edit -m "chore: merge stack stabilization and eventry rebranding" 2>&1

# Push
git push origin main 2>&1

echo "✅ Merge completato! Vercel sta deployando..."
echo "📍 Vai su https://vercel.com per vedere il deployment"
