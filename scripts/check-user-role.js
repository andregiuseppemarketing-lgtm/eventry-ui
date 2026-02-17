const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log('📋 Utenti nel database:\n');
    users.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email}`);
      console.log(`   Nome: ${user.name || 'N/A'}`);
      console.log(`   Ruolo: ${user.role}`);
      console.log(`   ID: ${user.id}\n`);
    });

    console.log('\n💡 Per cambiare il ruolo di un utente, usa:');
    console.log('node scripts/set-admin.js <email>');
  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserRole();
