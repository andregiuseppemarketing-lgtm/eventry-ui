const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🎉 Popolamento dati evento Notte Bianca...\n');

  const eventId = 'cmi0d5l0b000l6d8v6qyvwdgn';
  
  // Ottieni i PR users
  const prUsers = await prisma.user.findMany({
    where: { role: 'PR' },
    take: 3
  });

  if (prUsers.length === 0) {
    console.error('❌ Nessun PR trovato nel database');
    process.exit(1);
  }

  console.log(`✅ Trovati ${prUsers.length} PR\n`);

  // Crea liste per ogni PR
  const lists = [];
  const listNames = ['Lista Marco VIP', 'Lista Sofia Standard', 'Lista Luca Friends'];
  const listTypes = ['PR', 'PR', 'GUEST'];
  
  console.log('📋 Creazione liste...');
  for (let i = 0; i < 3; i++) {
    const list = await prisma.list.create({
      data: {
        name: listNames[i],
        eventId,
        type: listTypes[i],
        quotaTotal: 30,
      }
    });
    lists.push({ ...list, prUser: prUsers[i] });
    console.log(`   ✅ ${list.name}`);
  }

  console.log(`\n✅ ${lists.length} liste create\n`);
  
  // Aggiorna i ticket esistenti assegnandoli casualmente alle liste
  const tickets = await prisma.ticket.findMany({
    where: { eventId },
    include: { guest: true }
  });

  console.log(`📝 Assegnazione ${tickets.length} ticket alle liste...`);
  console.log(`   Tickets con guest: ${tickets.filter(t => t.guest).length}`);
  
  let assigned = 0;
  for (const ticket of tickets) {
    // 70% dei ticket vengono assegnati a una lista
    const shouldAssign = Math.random() > 0.3;
    const hasGuest = !!ticket.guest;
    
    if (shouldAssign && hasGuest) {
      const randomList = lists[Math.floor(Math.random() * lists.length)];
      
      try {
        // Crea list entry
        const listEntry = await prisma.listEntry.create({
          data: {
            listId: randomList.id,
            guestId: ticket.guestId,
            addedByUserId: randomList.prUser.id, // PR che ha aggiunto
            firstName: ticket.guest.firstName,
            lastName: ticket.guest.lastName,
            email: ticket.guest.email,
            phone: ticket.guest.phone,
            status: 'CONFIRMED', // Tutti confermati
            note: Math.random() > 0.8 ? 'Tavolo richiesto' : null,
          }
        });

        // Collega il ticket al list entry
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { listEntryId: listEntry.id }
        });

        assigned++;
      } catch (error) {
        console.log(`   ❌ Errore: ${error.message}`);
        if (error.code) console.log(`      Code: ${error.code}`);
      }
    }
  }

  console.log(`✅ ${assigned} ticket assegnati alle liste\n`);

  // Statistiche finali
  const stats = await prisma.list.findMany({
    where: { eventId },
    include: {
      _count: {
        select: { entries: true }
      }
    }
  });

  console.log('📊 Statistiche Liste:');
  stats.forEach((list, i) => {
    const pr = lists.find(l => l.id === list.id)?.prUser;
    console.log(`   ${list.name} (PR: ${pr?.name || 'N/A'}): ${list._count.entries} persone`);
  });

  console.log('\n✅ Popolamento completato!');
}

main()
  .catch((e) => {
    console.error('❌ Errore:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
