#!/usr/bin/env tsx
/**
 * Script di test per il sistema email
 * Testa tutte le funzionalità senza inviare email reali
 */

import { sendBirthdayEmail, sendVIPPromotionEmail, sendReEngagementEmail } from '../lib/email';

async function testEmailSystem() {
  console.log('🧪 TEST SISTEMA EMAIL\n');
  console.log('📧 Modalità: DEVELOPMENT (nessuna email reale verrà inviata)\n');
  console.log('─'.repeat(60));

  // Test 1: Email Compleanno
  console.log('\n1️⃣  TEST: Email Compleanno');
  console.log('─'.repeat(60));
  const birthdayResult = await sendBirthdayEmail(
    'mario.rossi@example.com',
    'Mario',
    'BIRTHDAY2025-VIP123'
  );
  console.log('Risultato:', birthdayResult.success ? '✅ Successo' : '❌ Fallito');
  if (birthdayResult.messageId) {
    console.log('Message ID:', birthdayResult.messageId);
  }
  if (birthdayResult.error) {
    console.log('Errore:', birthdayResult.error);
  }

  // Test 2: Email Promozione VIP
  console.log('\n2️⃣  TEST: Email Promozione VIP');
  console.log('─'.repeat(60));
  const vipBenefits = [
    '🎫 Ingresso prioritario',
    '🍸 Cocktail omaggio',
    '📅 Prenotazioni anticipate',
  ];
  const vipResult = await sendVIPPromotionEmail(
    'laura.bianchi@example.com',
    'Laura',
    vipBenefits
  );
  console.log('Risultato:', vipResult.success ? '✅ Successo' : '❌ Fallito');
  if (vipResult.messageId) {
    console.log('Message ID:', vipResult.messageId);
  }
  if (vipResult.error) {
    console.log('Errore:', vipResult.error);
  }

  // Test 3: Email Re-engagement
  console.log('\n3️⃣  TEST: Email Re-engagement');
  console.log('─'.repeat(60));
  const reEngagementResult = await sendReEngagementEmail(
    'giovanni.verdi@example.com',
    'Giovanni',
    '🎁 Ingresso gratuito + 1 cocktail'
  );
  console.log('Risultato:', reEngagementResult.success ? '✅ Successo' : '❌ Fallito');
  if (reEngagementResult.messageId) {
    console.log('Message ID:', reEngagementResult.messageId);
  }
  if (reEngagementResult.error) {
    console.log('Errore:', reEngagementResult.error);
  }

  // Riepilogo
  console.log('\n' + '─'.repeat(60));
  console.log('📊 RIEPILOGO TEST');
  console.log('─'.repeat(60));
  
  const allTests = [birthdayResult, vipResult, reEngagementResult];
  const successCount = allTests.filter(r => r.success).length;
  const totalTests = allTests.length;
  
  console.log(`✅ Test riusciti: ${successCount}/${totalTests}`);
  console.log(`❌ Test falliti: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 Tutti i test sono passati con successo!');
    console.log('\n💡 SISTEMA FUNZIONANTE:');
    console.log('   ✅ Template email creati e funzionanti');
    console.log('   ✅ Funzioni di invio testate');
    console.log('   ✅ Dev mode operativo per test');
    console.log('\n📧 PER INVIARE EMAIL REALI:');
    console.log('   1. Crea account su https://resend.com (gratuito per 100 email/giorno)');
    console.log('   2. Verifica il tuo dominio email');
    console.log('   3. Copia la API key');
    console.log('   4. Aggiungi su Vercel:');
    console.log('      RESEND_API_KEY=re_xxxxxxxxxx');
    console.log('      EMAIL_FROM=PANICO <noreply@tuodominio.com>');
  } else {
    console.log('\n⚠️  Alcuni test sono falliti. Controlla i log sopra.');
  }
  
  console.log('\n');
}

// Esegui test
testEmailSystem()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Errore durante i test:', error);
    process.exit(1);
  });
