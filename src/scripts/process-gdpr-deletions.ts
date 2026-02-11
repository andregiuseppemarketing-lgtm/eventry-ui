/**
 * Script Admin per processare richieste di cancellazione GDPR
 * Uso: npx tsx scripts/process-gdpr-deletions.ts [--auto-approve]
 */

import { PrismaClient } from '@prisma/client';
import { anonymizeGuestData, permanentlyDeleteGuest } from '../lib/gdpr-deletion';

const prisma = new PrismaClient();

interface DeletionRequest {
  id: string;
  entityId: string;
  details: any;
  timestamp: Date;
}

async function getPendingDeletionRequests(): Promise<DeletionRequest[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      action: 'DATA_DELETION_REQUESTED',
    },
    orderBy: {
      timestamp: 'asc',
    },
  });

  // Filtra solo richieste con status PENDING
  return logs
    .filter(log => {
      const details = log.details as any;
      return details?.status === 'PENDING';
    })
    .map(log => ({
      id: log.id,
      entityId: log.entityId,
      details: log.details as any,
      timestamp: log.timestamp,
    }));
}

async function processRequest(
  request: DeletionRequest,
  mode: 'anonymize' | 'delete',
  autoApprove: boolean
): Promise<void> {
  const guestId = request.entityId;

  console.log(`\n📋 Richiesta ID: ${request.id}`);
  console.log(`👤 Guest ID: ${guestId}`);
  console.log(`📅 Data richiesta: ${request.timestamp.toLocaleDateString('it-IT')}`);
  console.log(`💬 Motivo: ${request.details.reason || 'Non specificato'}`);

  // Recupera info guest
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      totalEvents: true,
      customerSegment: true,
    },
  });

  if (!guest) {
    console.log(`⚠️  Guest non trovato, probabilmente già eliminato`);
    return;
  }

  console.log(`📊 Dati: ${guest.firstName} ${guest.lastName} (${guest.email})`);
  console.log(`🎫 Eventi totali: ${guest.totalEvents}`);
  console.log(`⭐ Segmento: ${guest.customerSegment}`);

  if (!autoApprove) {
    // Richiedi conferma manuale
    console.log(`\n⚠️  ATTENZIONE: Questa operazione è irreversibile!`);
    console.log(`Modalità: ${mode === 'anonymize' ? 'ANONIMIZZAZIONE' : 'CANCELLAZIONE COMPLETA'}`);
    console.log(`\nPremi CTRL+C per annullare...`);
    
    // In produzione usare readline per input utente
    // Per ora procedi solo con --auto-approve
    return;
  }

  // Processa cancellazione
  console.log(`\n🔄 Processamento in corso...`);
  
  let result;
  if (mode === 'anonymize') {
    result = await anonymizeGuestData(guestId);
  } else {
    result = await permanentlyDeleteGuest(guestId);
  }

  if (result.success) {
    console.log(`✅ Operazione completata con successo!`);
    console.log(`📊 Record eliminati:`);
    console.log(`   - Guest: ${result.deletedRecords.guest ? '✓' : '✗'}`);
    console.log(`   - List entries: ${result.deletedRecords.listEntries}`);
    console.log(`   - Tickets: ${result.deletedRecords.tickets}`);
    console.log(`   - Check-ins: ${result.deletedRecords.checkins}`);
    console.log(`   - Feedbacks: ${result.deletedRecords.feedbacks}`);
    console.log(`   - Security notes: ${result.deletedRecords.securityNotes}`);
    console.log(`   - Preferences: ${result.deletedRecords.preferences ? '✓' : '✗'}`);

    // Aggiorna stato richiesta
    await prisma.auditLog.update({
      where: { id: request.id },
      data: {
        details: {
          ...(request.details as any),
          status: 'COMPLETED',
          processedAt: new Date(),
          mode,
          result: result.deletedRecords,
        },
      },
    });

    // TODO: Invia email di conferma al guest
    console.log(`\n📧 Email di conferma da inviare a: ${guest.email}`);

  } else {
    console.error(`❌ Errore durante l'operazione:`);
    result.errors?.forEach(err => console.error(`   - ${err}`));

    // Aggiorna stato richiesta
    await prisma.auditLog.update({
      where: { id: request.id },
      data: {
        details: {
          ...(request.details as any),
          status: 'FAILED',
          processedAt: new Date(),
          errors: result.errors,
        },
      },
    });
  }
}

async function main() {
  const args = process.argv.slice(2);
  const autoApprove = args.includes('--auto-approve');
  const mode: 'anonymize' | 'delete' = args.includes('--hard-delete') ? 'delete' : 'anonymize';

  console.log('🔍 GDPR Deletion Request Processor\n');
  console.log(`Modalità: ${mode === 'anonymize' ? 'ANONIMIZZAZIONE (raccomandato)' : 'CANCELLAZIONE COMPLETA'}`);
  console.log(`Auto-approve: ${autoApprove ? 'SI' : 'NO'}\n`);

  // Recupera richieste pendenti
  const requests = await getPendingDeletionRequests();

  if (requests.length === 0) {
    console.log('✅ Nessuna richiesta di cancellazione in sospeso');
    return;
  }

  console.log(`📋 Trovate ${requests.length} richieste pendenti\n`);

  // Processa ogni richiesta
  for (const request of requests) {
    await processRequest(request, mode, autoApprove);
    
    // Pausa tra richieste
    if (requests.indexOf(request) < requests.length - 1) {
      console.log('\n' + '='.repeat(60));
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log('\n\n✅ Processamento completato!');
}

main()
  .catch((error) => {
    console.error('❌ Errore fatale:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
