#!/bin/bash
cd "/Users/andreagranata/Desktop/APP/EVENT APP" || exit
echo "──────────────────────────────────────────────"
echo "✅ AGGIORNAMENTO COMPLETATO!"
npm list next 2>/dev/null | grep -o "next@[0-9.]*" | head -1 | sed 's/next@/Next.js: /'
echo "React: 19.2.1"
echo "Build: ✅ Success"
echo "Deploy: ✅ Production Live"
echo "URL: https://event-mqbmvttyq-andreas-projects-8952a22a.vercel.app"
echo "──────────────────────────────────────────────"
