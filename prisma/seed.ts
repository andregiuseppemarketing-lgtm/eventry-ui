import { PrismaClient } from '@prisma/client';
import { generateTicketCode } from '../lib/ticket-code-generator';

// Define the enums that are used in the seed file
enum UserRole {
  ADMIN = 'ADMIN',
  ORGANIZER = 'ORGANIZER',
  PR = 'PR',
  STAFF = 'STAFF',
  USER = 'USER'
}

enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
  CLOSED = 'CLOSED'
}

enum Gender {
  M = 'M',
  F = 'F',
  NB = 'NB'
}

enum ListType {
  PR = 'PR',
  GUEST = 'GUEST',
  STAFF = 'STAFF'
}

enum EntryStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED'
}

enum TicketType {
  LIST = 'LIST',
  FREE = 'FREE',
  PAID = 'PAID'
}

enum TicketStatus {
  NEW = 'NEW',
  USED = 'USED',
  CANCELLED = 'CANCELLED'
}

enum Gate {
  MAIN = 'MAIN',
  VIP = 'VIP',
  STAFF = 'STAFF'
}
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.inviteLink.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.listEntry.deleteMany();
  await prisma.guest.deleteMany();
  await prisma.list.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.pRProfile.deleteMany();
  await prisma.event.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users with hashed passwords
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@eventry.app',
      passwordHash: await hash('admin123', 12),
      role: UserRole.ADMIN,
      phone: '+39 320 1234567',
    },
  });

  const organizerUser = await prisma.user.create({
    data: {
      name: 'Event Organizer',
      email: 'organizer@panico.app',
      passwordHash: await hash('organizer123', 12),
      role: UserRole.ORGANIZER,
      phone: '+39 320 2345678',
    },
  });

  // Create PR users with profiles
  const pr1User = await prisma.user.create({
    data: {
      name: 'Marco Rossi',
      email: 'marco.pr@panico.app',
      passwordHash: await hash('pr123', 12),
      role: UserRole.PR,
      phone: '+39 320 3456789',
    },
  });

  const pr1Profile = await prisma.pRProfile.create({
    data: {
      userId: pr1User.id,
      displayName: 'Marco R.',
      referralCode: 'MARCO2024',
      phone: '+39 320 3456789',
    },
  });

  const pr2User = await prisma.user.create({
    data: {
      name: 'Sofia Bianchi',
      email: 'sofia.pr@panico.app',
      passwordHash: await hash('pr123', 12),
      role: UserRole.PR,
      phone: '+39 320 4567890',
    },
  });

  const pr2Profile = await prisma.pRProfile.create({
    data: {
      userId: pr2User.id,
      displayName: 'Sofia B.',
      referralCode: 'SOFIA2024',
      phone: '+39 320 4567890',
    },
  });

  const pr3User = await prisma.user.create({
    data: {
      name: 'Luca Verdi',
      email: 'luca.pr@panico.app',
      passwordHash: await hash('pr123', 12),
      role: UserRole.PR,
      phone: '+39 320 5678901',
    },
  });

  const pr3Profile = await prisma.pRProfile.create({
    data: {
      userId: pr3User.id,
      displayName: 'Luca V.',
      referralCode: 'LUCA2024',
      phone: '+39 320 5678901',
    },
  });

  // Create staff users
  const staff1User = await prisma.user.create({
    data: {
      name: 'Anna Staff',
      email: 'anna.staff@panico.app',
      passwordHash: await hash('staff123', 12),
      role: UserRole.STAFF,
      phone: '+39 320 6789012',
    },
  });

  const staff2User = await prisma.user.create({
    data: {
      name: 'Giuseppe Staff',
      email: 'giuseppe.staff@panico.app',
      passwordHash: await hash('staff123', 12),
      role: UserRole.STAFF,
      phone: '+39 320 7890123',
    },
  });

  // Create regular users
  const users = [];
  for (let i = 1; i <= 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User${i}`,
        email: `user${i}@example.com`,
        passwordHash: await hash('user123', 12),
        role: UserRole.USER,
        phone: `+39 320 ${8900000 + i}`,
      },
    });
    users.push(user);
  }

  // Create venues
  const venue1 = await prisma.venue.create({
    data: {
      name: 'Club Catania',
      address: 'Via Roma, 123',
      city: 'Catania',
      capacity: 500,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: 'Lido Siracusa',
      address: 'Lungomare Ortigia, 45',
      city: 'Siracusa',
      capacity: 300,
    },
  });

  // Create events
  const futureDate1 = new Date();
  futureDate1.setDate(futureDate1.getDate() + 7);
  
  const futureDate2 = new Date();
  futureDate2.setDate(futureDate2.getDate() + 14);
  
  const futureDate3 = new Date();
  futureDate3.setDate(futureDate3.getDate() + 21);
  
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 7);

  const event1 = await prisma.event.create({
    data: {
      title: 'Notte Bianca Catania',
      description: 'Una notte indimenticabile nel cuore di Catania con i migliori DJ internazionali',
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=600',
      dateStart: futureDate1,
      dateEnd: new Date(futureDate1.getTime() + 6 * 60 * 60 * 1000), // +6 hours
      status: EventStatus.PUBLISHED,
      minAge: 18,
      dressCode: 'Elegante',
      venueId: venue1.id,
      createdByUserId: organizerUser.id,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Summer Beach Party',
      description: 'Festa in spiaggia con cocktails, musica e divertimento fino all\'alba',
      coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600',
      dateStart: futureDate2,
      dateEnd: new Date(futureDate2.getTime() + 8 * 60 * 60 * 1000), // +8 hours
      status: EventStatus.PUBLISHED,
      minAge: 21,
      dressCode: 'Beach Chic',
      venueId: venue2.id,
      createdByUserId: organizerUser.id,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Electronic Vibes',
      description: 'La migliore musica elettronica con artisti di fama mondiale',
      coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600',
      dateStart: futureDate3,
      dateEnd: new Date(futureDate3.getTime() + 7 * 60 * 60 * 1000), // +7 hours
      status: EventStatus.PUBLISHED,
      minAge: 18,
      venueId: venue1.id,
      createdByUserId: organizerUser.id,
    },
  });

  const pastEvent = await prisma.event.create({
    data: {
      title: 'Halloween Party 2024',
      description: 'La festa di Halloween più spettacolare dell\'anno',
      coverUrl: 'https://images.unsplash.com/photo-1509557965043-6b9f3fdc6c8a?w=800&h=600',
      dateStart: pastDate,
      dateEnd: new Date(pastDate.getTime() + 6 * 60 * 60 * 1000), // +6 hours
      status: EventStatus.CLOSED,
      minAge: 18,
      venueId: venue1.id,
      createdByUserId: organizerUser.id,
    },
  });

  // Create assignments
  await prisma.assignment.create({
    data: {
      eventId: event1.id,
      prProfileId: pr1Profile.id,
      quotaTotal: 50,
      quotaFemale: 25,
      quotaMale: 25,
    },
  });

  await prisma.assignment.create({
    data: {
      eventId: event1.id,
      prProfileId: pr2Profile.id,
      quotaTotal: 40,
      quotaFemale: 20,
      quotaMale: 20,
    },
  });

  await prisma.assignment.create({
    data: {
      eventId: event2.id,
      prProfileId: pr2Profile.id,
      quotaTotal: 60,
      quotaFemale: 35,
      quotaMale: 25,
    },
  });

  await prisma.assignment.create({
    data: {
      eventId: event2.id,
      prProfileId: pr3Profile.id,
      quotaTotal: 35,
      quotaFemale: 20,
      quotaMale: 15,
    },
  });

  // Create lists
  const prList1 = await prisma.list.create({
    data: {
      eventId: event1.id,
      name: 'Lista Marco',
      type: ListType.PR,
      quotaTotal: 50,
      quotaFemale: 25,
      quotaMale: 25,
    },
  });

  const prList2 = await prisma.list.create({
    data: {
      eventId: event1.id,
      name: 'Lista Sofia',
      type: ListType.PR,
      quotaTotal: 40,
      quotaFemale: 20,
      quotaMale: 20,
    },
  });

  const guestList1 = await prisma.list.create({
    data: {
      eventId: event1.id,
      name: 'Lista Invitati VIP',
      type: ListType.GUEST,
      quotaTotal: 20,
    },
  });

  const staffList1 = await prisma.list.create({
    data: {
      eventId: event1.id,
      name: 'Lista Staff',
      type: ListType.STAFF,
      quotaTotal: 10,
    },
  });

  // Helper function to generate random names
  const firstNames = ['Andrea', 'Marco', 'Sofia', 'Giulia', 'Luca', 'Elena', 'Francesco', 'Chiara', 'Alessandro', 'Martina', 'Davide', 'Sara', 'Matteo', 'Federica', 'Lorenzo', 'Valentina'];
  const lastNames = ['Rossi', 'Bianchi', 'Verdi', 'Neri', 'Romano', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Costa', 'Giordano', 'Mancini', 'Rizzo'];
  const domains = ['gmail.com', 'yahoo.it', 'hotmail.it', 'libero.it', 'tiscali.it'];

  function getRandomName() {
    return {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    };
  }

  function getRandomGender(): Gender {
    const genders = [Gender.F, Gender.M, Gender.NB];
    return genders[Math.floor(Math.random() * genders.length)];
  }

  // Create list entries
  const listEntries = [];
  
  // PR List 1 entries (30-50 entries)
  for (let i = 0; i < 35; i++) {
    const { firstName, lastName } = getRandomName();
    const entry = await prisma.listEntry.create({
      data: {
        listId: prList1.id,
        addedByUserId: pr1User.id,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@${domains[Math.floor(Math.random() * domains.length)]}`,
        phone: `+39 32${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 9000000) + 1000000}`,
        gender: getRandomGender(),
        status: i < 25 ? EntryStatus.CONFIRMED : EntryStatus.PENDING,
        plusOne: Math.random() > 0.7,
      },
    });
    listEntries.push(entry);
  }

  // PR List 2 entries (20-35 entries)
  for (let i = 0; i < 28; i++) {
    const { firstName, lastName } = getRandomName();
    const entry = await prisma.listEntry.create({
      data: {
        listId: prList2.id,
        addedByUserId: pr2User.id,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 100}@${domains[Math.floor(Math.random() * domains.length)]}`,
        phone: `+39 33${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 9000000) + 1000000}`,
        gender: getRandomGender(),
        status: i < 20 ? EntryStatus.CONFIRMED : EntryStatus.PENDING,
        plusOne: Math.random() > 0.8,
      },
    });
    listEntries.push(entry);
  }

  // Guest list entries (15-20 VIP entries)
  for (let i = 0; i < 18; i++) {
    const { firstName, lastName } = getRandomName();
    const entry = await prisma.listEntry.create({
      data: {
        listId: guestList1.id,
        addedByUserId: organizerUser.id,
        firstName,
        lastName,
        email: `vip.${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
        phone: `+39 34${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 9000000) + 1000000}`,
        gender: getRandomGender(),
        status: EntryStatus.CONFIRMED,
        note: 'VIP Guest',
      },
    });
    listEntries.push(entry);
  }

  // Staff entries
  const staffEntries = [
    { firstName: 'Anna', lastName: 'Staff', userId: staff1User.id },
    { firstName: 'Giuseppe', lastName: 'Staff', userId: staff2User.id },
  ];

  for (const staffData of staffEntries) {
    const entry = await prisma.listEntry.create({
      data: {
        listId: staffList1.id,
        addedByUserId: organizerUser.id,
        firstName: staffData.firstName,
        lastName: staffData.lastName,
        email: `${staffData.firstName.toLowerCase()}.${staffData.lastName.toLowerCase()}@panico.app`,
        phone: `+39 32${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 9000000) + 7000000}`,
        gender: staffData.firstName === 'Anna' ? Gender.F : Gender.M,
        status: EntryStatus.CONFIRMED,
        note: 'Staff Member',
      },
    });
    listEntries.push(entry);
  }

  // Create tickets for confirmed entries
  const confirmedEntries = listEntries.filter(entry => entry.status === EntryStatus.CONFIRMED);
  const tickets = [];

  for (const entry of confirmedEntries) {
    // Generate unique ticket code with new format
    const ticketCode = await generateTicketCode(event1.id);
    
    const ticket = await prisma.ticket.create({
      data: {
        eventId: event1.id,
        listEntryId: entry.id,
        issuedByUserId: entry.addedByUserId,
        type: TicketType.LIST,
        code: ticketCode,
        qrData: JSON.stringify({
          ticketId: ticketCode,
          eventId: event1.id,
          type: 'LIST',
          issuedAt: new Date().toISOString(),
        }),
        status: TicketStatus.NEW,
      },
    });
    tickets.push(ticket);
  }

  // Create some FREE tickets for regular users
  for (let i = 0; i < 10; i++) {
    const ticketCode = await generateTicketCode(event1.id);
    
    const ticket = await prisma.ticket.create({
      data: {
        eventId: event1.id,
        userId: users[i % users.length].id,
        issuedByUserId: organizerUser.id,
        type: TicketType.FREE,
        code: ticketCode,
        qrData: JSON.stringify({
          ticketId: ticketCode,
          eventId: event1.id,
          type: 'FREE',
          issuedAt: new Date().toISOString(),
        }),
        status: TicketStatus.NEW,
      },
    });
    tickets.push(ticket);
  }

  // Create check-ins for past event (simulate 60-80% usage)
  const pastEventTickets = tickets.slice(0, Math.floor(tickets.length * 0.7));
  
  for (const ticket of pastEventTickets) {
    const checkinTime = new Date(pastDate);
    checkinTime.setHours(21 + Math.floor(Math.random() * 4)); // Between 9 PM and 1 AM
    checkinTime.setMinutes(Math.floor(Math.random() * 60));

    await prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        scannedByUserId: Math.random() > 0.5 ? staff1User.id : staff2User.id,
        scannedAt: checkinTime,
        gate: Math.random() > 0.8 ? Gate.VIP : Gate.MAIN,
        ok: true,
      },
    });

    // Update ticket status
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.USED },
    });
  }

  // Create invite links
  await prisma.inviteLink.create({
    data: {
      createdByUserId: pr1User.id,
      eventId: event1.id,
      prProfileId: pr1Profile.id,
      slug: 'marco-notte-bianca-2024',
      maxUses: 50,
      uses: 12,
      expiresAt: new Date(futureDate1.getTime() - 24 * 60 * 60 * 1000), // 1 day before event
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'notte-bianca-promo',
    },
  });

  await prisma.inviteLink.create({
    data: {
      createdByUserId: pr2User.id,
      eventId: event2.id,
      prProfileId: pr2Profile.id,
      slug: 'sofia-beach-party-summer',
      maxUses: 60,
      uses: 8,
      expiresAt: new Date(futureDate2.getTime() - 24 * 60 * 60 * 1000), // 1 day before event
      utmSource: 'whatsapp',
      utmMedium: 'messaging',
      utmCampaign: 'beach-party-invite',
    },
  });

  // Create some audit logs
  const auditActions = [
    { action: 'user.login', entity: 'User', entityId: pr1User.id },
    { action: 'event.create', entity: 'Event', entityId: event1.id },
    { action: 'list.add_entry', entity: 'ListEntry', entityId: listEntries[0].id },
    { action: 'ticket.issue', entity: 'Ticket', entityId: tickets[0].id },
    { action: 'checkin.scan', entity: 'CheckIn', entityId: 'checkin-1' },
  ];

  for (const audit of auditActions) {
    await prisma.auditLog.create({
      data: {
        userId: Math.random() > 0.5 ? pr1User.id : organizerUser.id,
        action: audit.action,
        entity: audit.entity,
        entityId: audit.entityId,
        details: { timestamp: new Date().toISOString() },
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('\n🔑 Demo Credentials:');
  console.log('Admin: admin@eventry.app / admin123');
  console.log('Organizer: organizer@panico.app / organizer123');
  console.log('PR Marco: marco.pr@panico.app / pr123');
  console.log('PR Sofia: sofia.pr@panico.app / pr123');
  console.log('PR Luca: luca.pr@panico.app / pr123');
  console.log('Staff Anna: anna.staff@panico.app / staff123');
  console.log('Staff Giuseppe: giuseppe.staff@panico.app / staff123');
  console.log('User1-5: user1@example.com / user123 (user2, user3, etc.)');
  console.log('\n📊 Data Summary:');
  console.log(`- ${await prisma.user.count()} users created`);
  console.log(`- ${await prisma.venue.count()} venues created`);
  console.log(`- ${await prisma.event.count()} events created`);
  console.log(`- ${await prisma.listEntry.count()} list entries created`);
  console.log(`- ${await prisma.ticket.count()} tickets created`);
  console.log(`- ${await prisma.checkIn.count()} check-ins created`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });