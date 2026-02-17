const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestClub() {
  try {
    console.log('🎉 Creazione club di test...\n');

    // Trova l'utente admin
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.error('❌ Nessun admin trovato. Esegui prima create-admin.js');
      return;
    }

    console.log('✅ Admin trovato:', admin.email);

    // Crea prima un venue
    const venue = await prisma.venue.create({
      data: {
        name: 'The Grand Hall',
        address: 'Via Roma 123',
        city: 'Milano',
        capacity: 800,
      },
    });

    console.log('✅ Venue creato:', venue.name);

    // Crea il club con tutti i dati
    const club = await prisma.club.create({
      data: {
        name: 'NEON CLUB',
        type: 'DISCOTECA',
        description: 'Il locale più esclusivo di Milano. Musica elettronica di qualità, DJ internazionali e un\'atmosfera unica. Ogni weekend ti aspetta un\'esperienza indimenticabile con i migliori artisti della scena house e techno.',
        logo: 'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=400&h=400&fit=crop',
        coverImage: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1200&h=600&fit=crop',
        gallery: [
          'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571266028243-d220c6ba2f6c?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
        ],
        website: 'https://neonclub.it',
        phone: '+39 02 1234567',
        email: 'info@neonclub.it',
        instagram: 'https://instagram.com/neonclub',
        facebook: 'https://facebook.com/neonclub',
        openingHours: 'Venerdì e Sabato: 23:00 - 05:00\nDomenica: Chiuso\nLunedì-Giovedì: Eventi privati su prenotazione',
        priceRange: '€€€',
        amenities: [
          'Guardaroba',
          'Parcheggio',
          'Wi-Fi Free',
          'Servizio Privè',
          'Area VIP',
          'Bottle Service',
          'Lista Ospiti',
          'Servizio Sicurezza',
          'Bar Multipli',
          'Dancefloor',
          'Lounge Area',
          'Fotografi Professionali',
        ],
        musicGenres: [
          'House',
          'Techno',
          'Deep House',
          'Tech House',
          'Progressive House',
          'Melodic Techno',
        ],
        owner: {
          connect: { id: admin.id },
        },
        venues: {
          connect: { id: venue.id },
        },
      },
    });

    console.log('✅ Club creato:', club.name);
    console.log('   ID:', club.id);
    console.log('   Logo:', club.logo ? '✅' : '❌');
    console.log('   Cover:', club.coverImage ? '✅' : '❌');
    console.log('   Gallery:', club.gallery.length, 'foto');
    console.log('   Amenities:', club.amenities.length);
    console.log('   Generi:', club.musicGenres.length);

    // Crea alcuni eventi futuri per il club
    const events = [];
    const today = new Date();

    // Evento questo weekend
    const event1Date = new Date(today);
    event1Date.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7)); // Prossimo sabato
    event1Date.setHours(23, 0, 0, 0);

    const event1 = await prisma.event.create({
      data: {
        title: 'NEON NIGHTS: HOUSE SESSION',
        description: 'Una notte dedicata alla house music con DJ internazionali. Preparati a ballare fino all\'alba con le migliori produzioni house del momento.',
        dateStart: event1Date.toISOString(),
        coverUrl: 'https://images.unsplash.com/photo-1571266028243-d220c6ba2f6c?w=1200&h=600&fit=crop',
        status: 'PUBLISHED',
        venue: {
          connect: { id: venue.id },
        },
        createdBy: {
          connect: { id: admin.id },
        },
      },
    });
    events.push(event1);

    // Evento settimana prossima
    const event2Date = new Date(event1Date);
    event2Date.setDate(event1Date.getDate() + 7);

    const event2 = await prisma.event.create({
      data: {
        title: 'TECHNO UNDERGROUND',
        description: 'La techno più oscura e ipnotica con resident DJ e guest star internazionali. Un viaggio sonoro nelle profondità della techno underground.',
        dateStart: event2Date.toISOString(),
        coverUrl: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&h=600&fit=crop',
        status: 'PUBLISHED',
        venue: {
          connect: { id: venue.id },
        },
        createdBy: {
          connect: { id: admin.id },
        },
      },
    });
    events.push(event2);

    // Evento tra 2 settimane
    const event3Date = new Date(event1Date);
    event3Date.setDate(event1Date.getDate() + 14);

    const event3 = await prisma.event.create({
      data: {
        title: 'PROGRESSIVE VIBES',
        description: 'Una serata all\'insegna della progressive house con un lineup di artisti selezionati. Melodie ipnotiche e ritmi travolgenti.',
        dateStart: event3Date.toISOString(),
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200&h=600&fit=crop',
        status: 'PUBLISHED',
        venue: {
          connect: { id: venue.id },
        },
        createdBy: {
          connect: { id: admin.id },
        },
      },
    });
    events.push(event3);

    console.log('\n✅ Eventi creati:', events.length);
    events.forEach((e, i) => {
      const eventDate = new Date(e.dateStart);
      console.log(`   ${i + 1}. ${e.title}`);
      console.log(`      Data: ${eventDate.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}`);
    });

    console.log('\n🎉 Setup completato!');
    console.log(`\n🌐 Visita: http://localhost:3000/clubs/${club.id}`);

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestClub();
