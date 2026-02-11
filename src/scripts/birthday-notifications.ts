#!/usr/bin/env tsx
/**
 * Script per inviare notifiche di compleanno
 * Da eseguire ogni giorno per trovare clienti che compiono gli anni
 */

import { PrismaClient } from '@prisma/client';
import { sendBirthdayEmail } from '@/lib/email';

const prisma = new PrismaClient();

async function sendBirthdayNotifications() {
  console.log('🎂 Inizio invio notifiche compleanno...\n');

  try {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentDay = today.getDate(); // 1-31

    console.log(`📅 Data: ${currentDay}/${currentMonth}`);

    // Trova guest con compleanno oggi
    const birthdayGuests = await prisma.guest.findMany({
      where: {
        AND: [
          { birthDate: { not: null } },
          { email: { not: null } },
          {
            birthDate: {
              gte: new Date(1900, currentMonth - 1, currentDay, 0, 0, 0),
              lt: new Date(2100, currentMonth - 1, currentDay + 1, 0, 0, 0),
            },
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        birthDate: true,
        customerSegment: true,
      },
    });

    console.log(`\n🎉 Trovati ${birthdayGuests.length} compleanni oggi!\n`);

    if (birthdayGuests.length === 0) {
      console.log('Nessun compleanno da festeggiare oggi.');
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const guest of birthdayGuests) {
      try {
        if (!guest.email) continue;

        const age = guest.birthDate
          ? today.getFullYear() - new Date(guest.birthDate).getFullYear()
          : undefined;

        console.log(`📧 Inviando a ${guest.firstName} ${guest.lastName} (${age} anni)...`);

        // Genera codice sconto per VIP
        const discountCode = guest.customerSegment === 'VIP' 
          ? `BIRTHDAY${today.getFullYear()}-${guest.id.slice(-6).toUpperCase()}`
          : undefined;

        const result = await sendBirthdayEmail(
          guest.email,
          guest.firstName,
          discountCode
        );

        if (result.success) {
          sent++;
          console.log(`   ✅ Inviata con successo`);
          
          // Opzionale: Traccia l'invio nel database
          // await prisma.auditLog.create({
          //   data: {
          //     action: 'BIRTHDAY_EMAIL_SENT',
          //     userId: 'system',
          //     targetType: 'Guest',
          //     targetId: guest.id,
          //     metadata: { messageId: result.messageId },
          //   },
          // });
        } else {
          failed++;
          console.log(`   ❌ Errore: ${result.error}`);
        }

      } catch (error) {
        failed++;
        console.error(`   ❌ Errore per ${guest.firstName}:`, error);
      }

      // Pausa per evitare rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Riepilogo:');
    console.log(`   ✅ Email inviate: ${sent}`);
    console.log(`   ❌ Email fallite: ${failed}`);
    console.log(`   📧 Totale: ${birthdayGuests.length}`);

  } catch (error) {
    console.error('❌ Errore durante l\'invio:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  sendBirthdayNotifications()
    .then(() => {
      console.log('\n🎉 Script completato!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script terminato con errori:', error);
      process.exit(1);
    });
}

export { sendBirthdayNotifications };
