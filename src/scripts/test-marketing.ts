#!/usr/bin/env tsx
/**
 * Script di test per le automazioni marketing
 * Simula l'esecuzione delle campagne con dati di test
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMarketingAutomations() {
  console.log('🎯 TEST AUTOMAZIONI MARKETING\n');
  console.log('─'.repeat(60));

  try {
    // Test 1: Trova clienti con compleanno oggi (simulato)
    console.log('\n1️⃣  TEST: Notifiche Compleanno');
    console.log('─'.repeat(60));
    
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    
    console.log(`📅 Cercando compleanni del giorno: ${currentDay}/${currentMonth}`);
    
    const birthdayGuests = await prisma.guest.findMany({
      where: {
        AND: [
          { birthDate: { not: null } },
          { email: { not: null } },
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
      take: 5,
    });

    console.log(`📊 Clienti con email e compleanno nel DB: ${birthdayGuests.length}`);
    
    if (birthdayGuests.length > 0) {
      console.log('\n👥 Esempi di clienti:');
      birthdayGuests.forEach((guest, i) => {
        const birthDate = guest.birthDate ? new Date(guest.birthDate) : null;
        const age = birthDate ? today.getFullYear() - birthDate.getFullYear() : '?';
        const segment = guest.customerSegment || 'N/A';
        console.log(`   ${i + 1}. ${guest.firstName} ${guest.lastName}`);
        console.log(`      📧 ${guest.email}`);
        console.log(`      🎂 Compleanno: ${birthDate ? `${birthDate.getDate()}/${birthDate.getMonth() + 1}` : 'N/A'} (${age} anni)`);
        console.log(`      ⭐ Segmento: ${segment}`);
      });
    }

    // Test 2: Clienti Dormienti (>60 giorni)
    console.log('\n2️⃣  TEST: Re-engagement Clienti Dormienti');
    console.log('─'.repeat(60));
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    
    const dormantGuests = await prisma.guest.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { customerSegment: 'DORMANT' },
          {
            OR: [
              { lastEventDate: { lt: sixtyDaysAgo } },
              { lastEventDate: null },
            ],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        lastEventDate: true,
        totalEvents: true,
        customerSegment: true,
      },
      take: 10,
    });

    console.log(`📊 Clienti dormienti (>60 giorni): ${dormantGuests.length}`);
    
    if (dormantGuests.length > 0) {
      console.log('\n👥 Esempi di clienti dormienti:');
      dormantGuests.slice(0, 5).forEach((guest, i) => {
        const daysSinceLastEvent = guest.lastEventDate
          ? Math.floor((today.getTime() - new Date(guest.lastEventDate).getTime()) / (1000 * 60 * 60 * 24))
          : 'Mai partecipato';
        const offer = (guest.totalEvents || 0) >= 5
          ? '🎁 Ingresso gratuito + cocktail'
          : (guest.totalEvents || 0) >= 2
          ? '🎫 Sconto 50%'
          : '🎉 Lista prioritaria';
        
        console.log(`   ${i + 1}. ${guest.firstName} ${guest.lastName}`);
        console.log(`      📧 ${guest.email}`);
        console.log(`      📅 Ultimo evento: ${daysSinceLastEvent} giorni fa`);
        console.log(`      🎯 Eventi totali: ${guest.totalEvents || 0}`);
        console.log(`      🎁 Offerta: ${offer}`);
      });
    } else {
      console.log('   ℹ️  Nessun cliente dormiente trovato (ottimo! 🎉)');
    }

    // Test 3: Candidati VIP (10+ eventi, non ancora VIP)
    console.log('\n3️⃣  TEST: Promozione VIP Automatica');
    console.log('─'.repeat(60));
    
    const vipCandidates = await prisma.guest.findMany({
      where: {
        AND: [
          { email: { not: null } },
          { totalEvents: { gte: 10 } },
          { customerSegment: { not: 'VIP' } },
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
      take: 10,
    });

    console.log(`📊 Candidati per promozione VIP: ${vipCandidates.length}`);
    
    if (vipCandidates.length > 0) {
      console.log('\n👥 Clienti che diventeranno VIP:');
      vipCandidates.forEach((guest, i) => {
        console.log(`   ${i + 1}. ${guest.firstName} ${guest.lastName}`);
        console.log(`      📧 ${guest.email}`);
        console.log(`      🎯 Eventi: ${guest.totalEvents}`);
        console.log(`      ⭐ Segmento attuale: ${guest.customerSegment || 'N/A'}`);
      });
    } else {
      console.log('   ℹ️  Nessun candidato VIP trovato al momento');
    }

    // Test 4: Statistiche generali
    console.log('\n4️⃣  STATISTICHE GENERALI DATABASE');
    console.log('─'.repeat(60));
    
    const [
      totalGuests,
      guestsWithEmail,
      vipCount,
      regularCount,
      occasionalCount,
      newCount,
      dormantCount,
    ] = await Promise.all([
      prisma.guest.count(),
      prisma.guest.count({ where: { email: { not: null } } }),
      prisma.guest.count({ where: { customerSegment: 'VIP' } }),
      prisma.guest.count({ where: { customerSegment: 'REGULAR' } }),
      prisma.guest.count({ where: { customerSegment: 'OCCASIONAL' } }),
      prisma.guest.count({ where: { customerSegment: 'NEW' } }),
      prisma.guest.count({ where: { customerSegment: 'DORMANT' } }),
    ]);

    console.log(`👥 Totale clienti: ${totalGuests}`);
    console.log(`📧 Con email: ${guestsWithEmail} (${((guestsWithEmail / totalGuests) * 100).toFixed(1)}%)`);
    console.log('\n📊 Distribuzione per segmento:');
    console.log(`   ⭐ VIP: ${vipCount}`);
    console.log(`   🔥 REGULAR: ${regularCount}`);
    console.log(`   👍 OCCASIONAL: ${occasionalCount}`);
    console.log(`   🆕 NEW: ${newCount}`);
    console.log(`   💤 DORMANT: ${dormantCount}`);

    // Riepilogo
    console.log('\n' + '─'.repeat(60));
    console.log('📋 RIEPILOGO TEST');
    console.log('─'.repeat(60));
    
    const potentialEmails = (birthdayGuests.length > 0 ? 1 : 0) +
                           (dormantGuests.length > 0 ? 1 : 0) +
                           (vipCandidates.length > 0 ? 1 : 0);
    
    console.log(`✅ Automazioni attive: ${potentialEmails}/3`);
    console.log(`📧 Email potenziali da inviare:`);
    console.log(`   🎂 Compleanno: ~${birthdayGuests.filter(g => {
      const bd = g.birthDate ? new Date(g.birthDate) : null;
      return bd && bd.getDate() === currentDay && (bd.getMonth() + 1) === currentMonth;
    }).length} (compleanni di oggi)`);
    console.log(`   💫 Re-engagement: ${dormantGuests.length}`);
    console.log(`   ⭐ Promozione VIP: ${vipCandidates.length}`);
    
    console.log('\n💡 STATO SISTEMA:');
    if (guestsWithEmail === 0) {
      console.log('   ⚠️  Nessun cliente con email nel database');
      console.log('   📝 Aggiungi email ai clienti per testare le automazioni');
    } else if (potentialEmails === 0) {
      console.log('   ℹ️  Nessuna campagna attiva al momento');
      console.log('   ✨ Il sistema è pronto e funzionerà quando necessario');
    } else {
      console.log('   ✅ Sistema operativo con campagne attive!');
    }

  } catch (error) {
    console.error('\n❌ Errore durante i test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui test
testMarketingAutomations()
  .then(() => {
    console.log('\n✅ Test completati con successo!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test falliti:', error.message);
    process.exit(1);
  });
