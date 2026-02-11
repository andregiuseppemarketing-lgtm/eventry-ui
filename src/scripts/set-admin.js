const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setAdmin() {
  try {
    const email = process.argv[2];

    if (!email) {
      console.log('❌ Devi specificare un email!');
      console.log('Uso: node scripts/set-admin.js <email>');
      process.exit(1);
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ Utente con email ${email} non trovato!`);
      process.exit(1);
    }

    if (user.role === 'ADMIN') {
      console.log(`✅ L'utente ${email} è già ADMIN`);
      process.exit(0);
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });

    console.log(`✅ Ruolo aggiornato con successo!`);
    console.log(`   Email: ${updated.email}`);
    console.log(`   Nome: ${updated.name || 'N/A'}`);
    console.log(`   Ruolo: ${updated.role} (era ${user.role})`);
  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
