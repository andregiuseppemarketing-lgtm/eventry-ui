const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Funzione per generare codici ticket
function generateSimpleTicketCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

const firstNames = [
  'Mario', 'Luigi', 'Giuseppe', 'Francesco', 'Antonio', 'Marco', 'Andrea', 'Luca', 'Giovanni', 'Alessandro',
  'Maria', 'Anna', 'Giulia', 'Laura', 'Sara', 'Chiara', 'Francesca', 'Elena', 'Martina', 'Sofia',
  'Matteo', 'Lorenzo', 'Gabriele', 'Davide', 'Simone', 'Riccardo', 'Federico', 'Tommaso', 'Nicola', 'Emanuele',
  'Valentina', 'Alessia', 'Federica', 'Silvia', 'Claudia', 'Serena', 'Elisa', 'Cristina', 'Roberta', 'Paola',
  'Stefano', 'Paolo', 'Roberto', 'Claudio', 'Massimo', 'Daniele', 'Vincenzo', 'Fabio', 'Alberto', 'Giacomo'
];

const lastNames = [
  'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco',
  'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo', 'Lombardi', 'Moretti',
  'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone',
  'Longo', 'Gentile', 'Martinelli', 'Vitale', 'Lombardo', 'Serra', 'Coppola', 'De Santis', 'D\'Angelo', 'Marchetti',
  'Parisi', 'Villa', 'Conte', 'Ferraro', 'Fabbri', 'Benedetti', 'Palumbo', 'Rossetti', 'Caputo', 'Giuliani'
];

const ticketTypes = [
  { type: 'VIP', price: 50, count: 15 },
  { type: 'STANDARD', price: 25, count: 40 },
  { type: 'STUDENT', price: 15, count: 25 },
  { type: 'OMAGGIO', price: 0, count: 10 }
];

const cities = [
  'Catania', 'Palermo', 'Messina', 'Siracusa', 'Ragusa', 'Trapani', 'Agrigento', 'Caltanissetta', 'Enna',
  'Roma', 'Milano', 'Napoli', 'Torino', 'Bologna', 'Firenze', 'Venezia', 'Bari', 'Genova'
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateRandomBirthDate() {
  // Età tra 18 e 45 anni
  const age = 18 + Math.floor(Math.random() * 27);
  const year = new Date().getFullYear() - age;
  const month = Math.floor(Math.random() * 12);
  const day = Math.floor(Math.random() * 28) + 1;
  return new Date(year, month, day);
}

function generateRandomEmail(firstName, lastName) {
  const domains = ['gmail.com', 'outlook.com', 'yahoo.it', 'libero.it', 'hotmail.com'];
  const cleanFirst = firstName.toLowerCase().replace(/[àáâä]/g, 'a').replace(/[èéêë]/g, 'e');
  const cleanLast = lastName.toLowerCase().replace(/[àáâä]/g, 'a').replace(/[èéêë]/g, 'e').replace(/'/g, '');
  const random = Math.floor(Math.random() * 100);
  return `${cleanFirst}.${cleanLast}${random > 50 ? random : ''}@${getRandomElement(domains)}`;
}

function generateRandomPhone() {
  const prefixes = ['320', '328', '329', '330', '331', '333', '334', '335', '338', '339', '340', '342', '345', '346', '347', '348', '349'];
  const prefix = getRandomElement(prefixes);
  const number = Math.floor(1000000 + Math.random() * 9000000);
  return `${prefix}${number}`;
}

async function main() {
  console.log('🎫 Creazione ticket di test...\n');

  // Trova l'evento "Notte Bianca"
  const event = await prisma.event.findFirst({
    where: {
      title: {
        contains: 'Notte Bianca',
        mode: 'insensitive'
      }
    }
  });

  if (!event) {
    console.error('❌ Evento "Notte Bianca" non trovato!');
    console.log('📋 Eventi disponibili:');
    const events = await prisma.event.findMany({
      select: { id: true, title: true }
    });
    events.forEach(e => console.log(`   - ${e.title} (${e.id})`));
    process.exit(1);
  }

  console.log(`✅ Trovato evento: ${event.title} (${event.id})\n`);

  // Elimina eventuali ticket di test esistenti
  const deletedCount = await prisma.ticket.deleteMany({
    where: { eventId: event.id }
  });
  console.log(`🗑️  Eliminati ${deletedCount.count} ticket esistenti\n`);

  let totalCreated = 0;
  const createdTickets = [];

  // Crea ticket per ogni tipo
  for (const { type, price, count } of ticketTypes) {
    console.log(`📝 Creazione ${count} ticket di tipo ${type}...`);
    
    for (let i = 0; i < count; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const email = generateRandomEmail(firstName, lastName);
      const phone = generateRandomPhone();
      
      // Alcuni ticket sono già stati usati (checked in)
      const isCheckedIn = Math.random() > 0.6; // 40% checked in
      const checkedInAt = isCheckedIn 
        ? new Date(event.dateStart.getTime() + Math.random() * 3600000) // Random time during event
        : null;

      const ticketCode = generateSimpleTicketCode();

      try {
        // Prima crea il guest con dati completi
        const guest = await prisma.guest.create({
          data: {
            firstName,
            lastName,
            email,
            phone,
            birthDate: generateRandomBirthDate(),
            city: getRandomElement(cities),
            totalEvents: 1,
            lastEventDate: new Date(),
          }
        });

        // Poi crea il ticket associato al guest
        const ticket = await prisma.ticket.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            type: price > 0 ? 'PAID' : 'FREE',
            price,
            code: ticketCode,
            qrData: JSON.stringify({
              code: ticketCode,
              eventId: event.id,
              ticketType: type,
              guestName: `${firstName} ${lastName}`,
            }),
            status: isCheckedIn ? 'USED' : 'NEW',
            issuedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          }
        });

        // Se il ticket è stato usato, crea anche il check-in
        if (isCheckedIn) {
          await prisma.checkIn.create({
            data: {
              ticketId: ticket.id,
              scannedByUserId: 'cmi0d5jha00016d8v2fkh2wb2', // ID organizer
              scannedAt: checkedInAt,
              gate: 'MAIN',
              ok: true,
            }
          });
        }
        
        createdTickets.push(ticket);
        totalCreated++;
      } catch (error) {
        console.error(`   ❌ Errore creazione ticket: ${error.message}`);
      }
    }
    
    console.log(`   ✅ Creati ${count} ticket ${type}`);
  }

  console.log(`\n✨ Totale ticket creati: ${totalCreated}`);
  console.log(`\n📊 Statistiche:`);
  console.log(`   - VIP: ${ticketTypes[0].count} ticket`);
  console.log(`   - STANDARD: ${ticketTypes[1].count} ticket`);
  console.log(`   - STUDENT: ${ticketTypes[2].count} ticket`);
  console.log(`   - OMAGGIO: ${ticketTypes[3].count} ticket`);
  
  const checkedIn = createdTickets.filter(t => t.used).length;
  console.log(`   - Check-in effettuati: ${checkedIn}/${totalCreated}`);
  
  const totalRevenue = createdTickets.reduce((sum, t) => sum + t.price, 0);
  console.log(`   - Incasso totale: €${totalRevenue}`);

  console.log('\n✅ Operazione completata!');
}

main()
  .catch((e) => {
    console.error('❌ Errore:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
