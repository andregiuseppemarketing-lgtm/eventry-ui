#!/usr/bin/env tsx
/**
 * Script per automazione VIP
 * Promuove automaticamente clienti a VIP e invia email di congratulazioni
 */

import { PrismaClient } from '@prisma/client';
import { sendVIPPromotionEmail } from '@/lib/email';

const prisma = new PrismaClient();

const VIP_BENEFITS = [
  '🎫 Ingresso prioritario a tutti gli eventi',
  '🍸 Un cocktail in omaggio ad ogni evento',
  '📅 Prenotazione tavoli con 48h di anticipo',
  '🎁 Sconti esclusivi su eventi speciali',
  '💌 Inviti early-bird per eventi limitati',
  '⭐ Supporto dedicato via WhatsApp',
];

async function runVIPAutomation() {
  console.log('⭐ Inizio automazione VIP...\n');

  try {
    // Trova clienti che meritano upgrade a VIP ma non lo sono ancora
    const eligibleGuests = await prisma.guest.findMany({
      where: {
        AND: [
          { totalEvents: { gte: 10 } }, // 10+ eventi
          { customerSegment: { not: 'VIP' } }, // Non ancora VIP
          { email: { not: null } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        totalEvents: true,
        customerSegment: true,
      },
    });

    console.log(`\n🎯 Trovati ${eligibleGuests.length} clienti eleggibili per VIP\n`);

    if (eligibleGuests.length === 0) {
      console.log('Nessun cliente da promuovere a VIP.');
      return;
    }

    let promoted = 0;
    let failed = 0;

    for (const guest of eligibleGuests) {
      try {
        if (!guest.email) continue;

        console.log(
          `⭐ Promuovendo ${guest.firstName} ${guest.lastName} (${guest.totalEvents} eventi)...`
        );

        // Aggiorna segmento a VIP
        await prisma.guest.update({
          where: { id: guest.id },
          data: { customerSegment: 'VIP' },
        });

        // Invia email di congratulazioni
        const result = await sendVIPPromotionEmail(
          guest.email,
          guest.firstName,
          VIP_BENEFITS
        );

        if (result.success) {
          promoted++;
          console.log(`   ✅ Promosso e notificato con successo`);

          // Log l'azione
          await prisma.auditLog.create({
            data: {
              action: 'VIP_PROMOTION',
              userId: 'admin-001', // System admin user
              entity: 'Guest',
              entityId: guest.id,
              details: {
                previousSegment: guest.customerSegment,
                totalEvents: guest.totalEvents,
                messageId: result.messageId,
              },
            },
          });

        } else {
          // Promozione avvenuta ma email fallita
          promoted++;
          console.log(`   ⚠️  Promosso ma email fallita: ${result.error}`);
        }

      } catch (error) {
        failed++;
        console.error(`   ❌ Errore per ${guest.firstName}:`, error);
      }

      // Pausa
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    console.log('\n📊 Riepilogo:');
    console.log(`   ⭐ Clienti promossi: ${promoted}`);
    console.log(`   ❌ Promozioni fallite: ${failed}`);
    console.log(`   👥 Totale processati: ${eligibleGuests.length}`);

    // Statistiche VIP totali
    const vipCount = await prisma.guest.count({
      where: { customerSegment: 'VIP' },
    });
    console.log(`\n🌟 Totale clienti VIP: ${vipCount}`);

  } catch (error) {
    console.error('❌ Errore durante l\'automazione VIP:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  runVIPAutomation()
    .then(() => {
      console.log('\n🎉 Automazione VIP completata!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script terminato con errori:', error);
      process.exit(1);
    });
}

export { runVIPAutomation };
