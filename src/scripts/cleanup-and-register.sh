#!/bin/bash

echo "🗑️  PULIZIA DATABASE E NUOVA REGISTRAZIONE"
echo ""
echo "Scegli un'opzione:"
echo ""
echo "1️⃣  Elimina TUTTI gli utenti di test (mantieni solo admin/staff/pr)"
echo "2️⃣  Elimina un utente specifico per email"
echo "3️⃣  Visualizza tutti gli utenti"
echo ""
read -p "Scelta (1/2/3): " choice

case $choice in
  1)
    echo ""
    echo "🗑️  Eliminazione utenti di test..."
    npx tsx -e "
    import { PrismaClient } from '@prisma/client';
    const prisma = new PrismaClient();
    
    // Mantieni solo utenti con ruoli importanti
    const keepRoles = ['ADMIN', 'ORGANIZER', 'STAFF', 'PR'];
    
    const deleted = await prisma.user.deleteMany({
      where: {
        role: {
          notIn: keepRoles
        }
      }
    });
    
    console.log(\`✅ Eliminati \${deleted.count} utenti di test\`);
    await prisma.\$disconnect();
    "
    ;;
  2)
    echo ""
    read -p "📧 Inserisci email da eliminare: " email
    npx tsx scripts/delete-user.ts "$email"
    ;;
  3)
    npx tsx scripts/list-users.ts
    ;;
  *)
    echo "❌ Scelta non valida"
    exit 1
    ;;
esac

echo ""
echo "✅ Operazione completata!"
echo ""
echo "📝 ORA PUOI REGISTRARTI:"
echo "   1. Vai su: http://localhost:3000/auth/register"
echo "   2. Compila il form con i tuoi dati"
echo "   3. Completa l'onboarding"
echo "   4. Fatto! ✨"
echo ""
