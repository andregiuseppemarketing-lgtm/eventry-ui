#!/bin/bash

# Lista dei file da fixare (path relativi alla root del progetto)
FILES=(
  "src/app/clienti/[id]/page.tsx"
  "src/app/clubs/[id]/page.tsx"
  "src/app/clubs/page.tsx"
  "src/app/lista/page.tsx"
  "src/app/situa/page.tsx"
  "src/app/user/profilo/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/gdpr/page.tsx"
  "src/app/feed/page.tsx"
  "src/app/marketing/funnel/page.tsx"
  "src/app/eventi/[id]/settings/complimentary/page.tsx"
  "src/app/eventi/[id]/checkout/page.tsx"
  "src/app/eventi/[id]/page.tsx"
  "src/app/eventi/nuovo/page.tsx"
  "src/app/onboarding/step-2/page.tsx"
  "src/app/onboarding/step-3/page.tsx"
  "src/app/analytics/[eventId]/page.tsx"
)

ROOT="/Users/andreagranata/Desktop/APP/eventry-ui"

for FILE in "${FILES[@]}"; do
  FULL_PATH="$ROOT/$FILE"
  
  # Estrai il nome della funzione export default
  FUNC_NAME=$(grep "export default function" "$FULL_PATH" | sed 's/export default function \([^(]*\).*/\1/')
  
  if [ -z "$FUNC_NAME" ]; then
    echo "⚠️  Skipping $FILE - no export default function found"
    continue
  fi
  
  # Determina il percorso del client component
  # Converte src/app/path/to/page.tsx in client-component-name
  RELATIVE=$(echo "$FILE" | sed 's|src/app/||' | sed 's|/page.tsx||')
  
  # Crea nome del client component file
  if [[ "$RELATIVE" == *"["*"]"* ]]; then
    # Se contiene parametri dinamici, usa il nome della funzione
    CLIENT_NAME=$(echo "$FUNC_NAME" | sed 's/Page$//' | sed 's/\(.\)\([A-Z]\)/\1-\2/g' | tr '[:upper:]' '[:lower:]')-client.tsx
  else
    # Altrimenti usa il path
    CLIENT_NAME=$(echo "$RELATIVE" | tr '/' '-')-page-client.tsx
  fi
  
  # Determina la directory per il client component
  if [[ "$RELATIVE" == auth/* ]]; then
    CLIENT_DIR="$ROOT/src/components/auth"
  elif [[ "$RELATIVE" == dashboard* ]]; then
    CLIENT_DIR="$ROOT/src/components/dashboard"
  elif [[ "$RELATIVE" == eventi/* ]]; then
    CLIENT_DIR="$ROOT/src/components/events"
  elif [[ "$RELATIVE" == analytics/* ]]; then
    CLIENT_DIR="$ROOT/src/components/analytics"
  elif [[ "$RELATIVE" == marketing/* ]]; then
    CLIENT_DIR="$ROOT/src/components/marketing"
  elif [[ "$RELATIVE" == onboarding/* ]]; then
    CLIENT_DIR="$ROOT/src/components/onboarding"
  else
    CLIENT_DIR="$ROOT/src/components"
  fi
  
  mkdir -p "$CLIENT_DIR"
  CLIENT_PATH="$CLIENT_DIR/$CLIENT_NAME"
  
  echo "Processing: $FILE"
  echo "  Function: $FUNC_NAME"
  echo "  Client: $CLIENT_PATH"
  
  # Copia il file al client component
  cp "$FULL_PATH" "$CLIENT_PATH"
  
  # Cambia export default in export named
  CLIENT_FUNC_NAME="${FUNC_NAME}Client"
  sed -i '' "s/export default function $FUNC_NAME/export function $CLIENT_FUNC_NAME/" "$CLIENT_PATH"
  
  # Determina l'import path relativo
  IMPORT_PATH=$(echo "$CLIENT_PATH" | sed "s|$ROOT/||" | sed 's|^src/|@/|' | sed 's|\.tsx$||')
  
  # Crea il server wrapper
  cat > "$FULL_PATH" <<EOF
import { Suspense } from 'react';
import { $CLIENT_FUNC_NAME } from '$IMPORT_PATH';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function $FUNC_NAME() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    }>
      <$CLIENT_FUNC_NAME />
    </Suspense>
  );
}
EOF
  
  echo "  ✅ Done"
  echo ""
done

echo "🎉 All files processed!"
