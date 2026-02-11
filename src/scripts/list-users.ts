/**
 * Script per visualizzare tutti gli utenti registrati
 * Usage: npx tsx scripts/list-users.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    console.log('\n📋 Lista utenti registrati:\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            eventsCreated: true,
            ticketsOwned: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (users.length === 0) {
      console.log('❌ Nessun utente trovato nel database.');
      return;
    }

    console.log(`Totale: ${users.length} utenti\n`);
    console.log('─'.repeat(100));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. 👤 ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Ruolo: ${user.role}`);
      console.log(`   Eventi creati: ${user._count.eventsCreated} | Tickets: ${user._count.ticketsOwned}`);
      console.log(`   Registrato: ${user.createdAt.toLocaleDateString('it-IT')}`);
    });

    console.log('\n' + '─'.repeat(100));
    console.log('\n💡 Per eliminare un utente: npx tsx scripts/delete-user.ts <email>');

  } catch (error) {
    console.error('\n❌ Errore:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();
