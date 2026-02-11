/**
 * Script per eliminare un utente dal database
 * Usage: npx tsx scripts/delete-user.ts <email>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUser(email: string) {
  try {
    console.log(`\n🔍 Cercando utente: ${email}...`);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log(`❌ Utente non trovato: ${email}`);
      return;
    }

    console.log('\n📋 Dettagli utente:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Nome: ${user.firstName} ${user.lastName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Ruolo: ${user.role}`);
    console.log(`   Registrato: ${user.createdAt.toLocaleDateString()}`);

    // Elimina l'utente (CASCADE eliminerà automaticamente dati correlati)
    console.log('\n🗑️  Eliminazione utente...');
    
    await prisma.user.delete({
      where: { id: user.id },
    });

    console.log('✅ Utente eliminato con successo!');
    console.log('\n📝 Nota: Dati correlati eliminati automaticamente (eventi, tickets, etc.)');

  } catch (error) {
    console.error('\n❌ Errore durante l\'eliminazione:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui script
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Uso: npx tsx scripts/delete-user.ts <email>');
  console.log('\nEsempio:');
  console.log('  npx tsx scripts/delete-user.ts test@example.com');
  process.exit(1);
}

deleteUser(email);
