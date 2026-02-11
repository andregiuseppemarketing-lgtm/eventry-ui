const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function exportData() {
  try {
    console.log('📊 Esportazione dati da SQLite...\n');

    // Esporta Users
    const users = await prisma.user.findMany({
      include: {
        prProfile: true,
      }
    });
    console.log(`✅ ${users.length} utenti`);

    // Esporta Events
    const events = await prisma.event.findMany({
      include: {
        venue: true,
      }
    });
    console.log(`✅ ${events.length} eventi`);

    // Esporta Tickets
    const tickets = await prisma.ticket.findMany();
    console.log(`✅ ${tickets.length} biglietti`);

    // Esporta Guests
    const guests = await prisma.guest.findMany();
    console.log(`✅ ${guests.length} ospiti`);

    // Esporta Lists
    const lists = await prisma.list.findMany({
      include: {
        entries: true,
      }
    });
    console.log(`✅ ${lists.length} liste`);

    // Esporta Venues
    const venues = await prisma.venue.findMany();
    console.log(`✅ ${venues.length} venue`);

    const data = {
      users,
      events,
      tickets,
      guests,
      lists,
      venues,
      exportDate: new Date().toISOString(),
    };

    const fs = require('fs');
    fs.writeFileSync(
      './prisma/export-data.json',
      JSON.stringify(data, null, 2)
    );

    console.log('\n✅ Dati esportati in prisma/export-data.json');
    
  } catch (error) {
    console.error('❌ Errore durante esportazione:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
