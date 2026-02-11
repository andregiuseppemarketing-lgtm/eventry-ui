#!/usr/bin/env tsx
/**
 * Script per re-engagement clienti dormienti
 * Invia email a clienti che non partecipano da oltre 60 giorni
 */

import { PrismaClient } from '@prisma/client';
import { sendReEngagementEmail } from '@/lib/email';

const prisma = new PrismaClient();

// Configurazione
const DORMANT_DAYS = 60; // Considera dormiente dopo 60 giorni
const BATCH_SIZE = 50;   // Invia max 50 email per esecuzione

async function sendReEngagementCampaign() {
  console.log('💫 Inizio campagna re-engagement...\n');

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DORMANT_DAYS);

    console.log(`📅 Cerco clienti inattivi dal: ${cutoffDate.toLocaleDateString('it-IT')}`);

    // Trova clienti dormienti
    const dormantGuests = await prisma.guest.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { customerSegment: 'DORMANT' },
          { lastEventDate: { not: null, lt: cutoffDate } },
          // Evita di inviare troppe email allo stesso cliente
          {
            updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // 30 giorni
          },
        ],
      },
      take: BATCH_SIZE,
      orderBy: {
        lastEventDate: 'asc', // Priorità a chi è inattivo da più tempo
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        lastEventDate: true,
        totalEvents: true,
        preferredDays: true,
      },
    });

    console.log(`\n🎯 Trovati ${dormantGuests.length} clienti dormienti\n`);

    if (dormantGuests.length === 0) {
      console.log('Nessun cliente dormiente da contattare.');
      return;
    }

    let sent = 0;
    let failed = 0;

    for (const guest of dormantGuests) {
      try {
        if (!guest.email || !guest.lastEventDate) continue;

        const daysSinceLastEvent = Math.floor(
          (Date.now() - guest.lastEventDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        console.log(
          `📧 ${guest.firstName} ${guest.lastName} - Ultimo evento: ${daysSinceLastEvent} giorni fa`
        );

        // Genera offerta speciale basata sulla storia del cliente
        let offer: string;
        if (guest.totalEvents >= 5) {
          // Cliente fedele
          offer = '🎁 Ingresso gratuito al prossimo evento + 1 cocktail in omaggio';
        } else if (guest.totalEvents >= 2) {
          // Cliente occasionale
          offer = '🎫 Sconto 50% sul prossimo biglietto';
        } else {
          // Cliente nuovo
          offer = '🎉 Lista prioritaria garantita';
        }

        const result = await sendReEngagementEmail(
          guest.email,
          guest.firstName,
          offer,
          guest.lastEventDate
        );

        if (result.success) {
          sent++;
          console.log(`   ✅ Email inviata`);

          // Aggiorna timestamp per evitare re-invii
          await prisma.guest.update({
            where: { id: guest.id },
            data: { updatedAt: new Date() },
          });

        } else {
          failed++;
          console.log(`   ❌ Errore: ${result.error}`);
        }

      } catch (error) {
        failed++;
        console.error(`   ❌ Errore per ${guest.firstName}:`, error);
      }

      // Pausa per rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n📊 Riepilogo:');
    console.log(`   ✅ Email inviate: ${sent}`);
    console.log(`   ❌ Email fallite: ${failed}`);
    console.log(`   📧 Totale processati: ${dormantGuests.length}`);
    console.log(`   💡 Offerte personalizzate generate`);

  } catch (error) {
    console.error('❌ Errore durante la campagna:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  sendReEngagementCampaign()
    .then(() => {
      console.log('\n🎉 Campagna completata!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script terminato con errori:', error);
      process.exit(1);
    });
}

export { sendReEngagementCampaign };
