const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const event = await prisma.event.findUnique({
    where: { id: 'cmi0d5l0b000l6d8v6qyvwdgn' },
    select: { 
      id: true, 
      title: true, 
      dateStart: true,
      status: true,
      createdByUserId: true
    }
  });
  
  console.log('Evento:', event);
  console.log('Data evento:', new Date(event.dateStart).toLocaleDateString('it-IT'));
  console.log('Oggi:', new Date().toLocaleDateString('it-IT'));
  
  const tickets = await prisma.ticket.count({
    where: { eventId: event.id }
  });
  console.log('\nTicket totali evento:', tickets);
  
  // Check periodo mese corrente
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  console.log('\nInizio mese corrente:', startOfMonth.toLocaleDateString('it-IT'));
  console.log('L\'evento è nel mese corrente?', event.dateStart >= startOfMonth && event.dateStart <= now);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
