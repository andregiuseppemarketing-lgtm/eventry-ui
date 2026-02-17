const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tickets = await prisma.ticket.findMany({
    where: { eventId: 'cmi0d5l0b000l6d8v6qyvwdgn' },
    select: { id: true, guestId: true }
  });
  
  console.log('Total tickets:', tickets.length);
  console.log('With guestId:', tickets.filter(t => t.guestId).length);
  console.log('Without guestId:', tickets.filter(t => !t.guestId).length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
