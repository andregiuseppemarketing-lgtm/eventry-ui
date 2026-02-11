/**
 * Script per popolare dati funnel di test
 * 
 * Uso: npx tsx scripts/seed-funnel-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedFunnelData() {
  console.log('🚀 Popolamento dati funnel di test...\n');

  try {
    // 1. Trova un evento esistente
    const event = await prisma.event.findFirst({
      where: { status: 'PUBLISHED' },
    });

    if (!event) {
      console.error('❌ Nessun evento trovato. Esegui prima: npx prisma db seed');
      return;
    }

    console.log(`✓ Evento selezionato: ${event.title}\n`);

    // 2. Pulisci dati funnel esistenti per questo evento
    await prisma.funnelTracking.deleteMany({
      where: { eventId: event.id },
    });

    console.log('✓ Dati funnel precedenti puliti\n');

    // 3. Genera sessioni funnel simulate
    const sources = ['instagram', 'facebook', 'google', 'direct', 'whatsapp'];
    const campaigns = ['summer_promo', 'black_friday', 'early_bird', null, null];
    
    let totalSessions = 0;
    let completedSessions = 0;

    // Simula 100 sessioni con diversi percorsi
    for (let i = 0; i < 100; i++) {
      const sessionId = `session_${Date.now()}_${i}`;
      const source = sources[Math.floor(Math.random() * sources.length)];
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const email = Math.random() > 0.5 ? `user${i}@test.com` : null;
      const phone = Math.random() > 0.7 ? `+3933${i.toString().padStart(7, '0')}` : null;

      totalSessions++;

      // STEP 1: View (100% arrivano qui)
      await prisma.funnelTracking.create({
        data: {
          eventId: event.id,
          sessionId,
          step: 'view',
          guestEmail: email,
          guestPhone: phone,
          metadata: { 
            source,
            campaign,
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' 
          },
        },
      });

      // STEP 2: Click (80% procedono)
      if (Math.random() > 0.2) {
        await new Promise(resolve => setTimeout(resolve, 10)); // Piccolo delay
        await prisma.funnelTracking.create({
          data: {
            eventId: event.id,
            sessionId,
            step: 'click',
            guestEmail: email,
            guestPhone: phone,
            metadata: { source, campaign },
          },
        });

        // STEP 3: Form Start (60% procedono)
        if (Math.random() > 0.4) {
          await new Promise(resolve => setTimeout(resolve, 10));
          await prisma.funnelTracking.create({
            data: {
              eventId: event.id,
              sessionId,
              step: 'form_start',
              guestEmail: email || `user${i}@test.com`, // Ora hanno email
              guestPhone: phone,
              metadata: { source, campaign },
            },
          });

          // STEP 4: Form Complete (75% di chi inizia, completa)
          if (Math.random() > 0.25) {
            await new Promise(resolve => setTimeout(resolve, 10));
            await prisma.funnelTracking.create({
              data: {
                eventId: event.id,
                sessionId,
                step: 'form_complete',
                guestEmail: email || `user${i}@test.com`,
                guestPhone: phone,
                metadata: { source, campaign },
              },
            });

            // STEP 5: Ticket Issued (90% ottiene biglietto)
            if (Math.random() > 0.1) {
              await new Promise(resolve => setTimeout(resolve, 10));
              await prisma.funnelTracking.create({
                data: {
                  eventId: event.id,
                  sessionId,
                  step: 'ticket_issued',
                  guestEmail: email || `user${i}@test.com`,
                  guestPhone: phone,
                  metadata: { source, campaign },
                },
              });
              completedSessions++;
            }
          }
        }
      }

      // Progress indicator
      if ((i + 1) % 20 === 0) {
        console.log(`⏳ Generati ${i + 1}/100 sessioni...`);
      }
    }

    console.log('\n✅ Popolamento completato!\n');
    console.log('📊 Statistiche:');
    console.log(`   - Evento: ${event.title}`);
    console.log(`   - Sessioni totali: ${totalSessions}`);
    console.log(`   - Conversioni: ${completedSessions}`);
    console.log(`   - Tasso conversione: ${((completedSessions / totalSessions) * 100).toFixed(1)}%\n`);
    console.log('🎯 Ora puoi visualizzare i dati su:');
    console.log('   http://localhost:3000/marketing/funnel\n');

  } catch (error) {
    console.error('❌ Errore:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedFunnelData();
