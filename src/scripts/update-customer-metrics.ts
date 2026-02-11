#!/usr/bin/env tsx
/**
 * Script per aggiornare le metriche dei clienti
 * Da eseguire periodicamente (es. ogni notte) per calcolare:
 * - totalEvents: numero totale di eventi a cui ha partecipato
 * - lastEventDate: data dell'ultimo evento
 * - customerSegment: segmentazione automatica (NEW/OCCASIONAL/REGULAR/VIP/DORMANT)
 * - averageGroupSize: dimensione media del gruppo
 * - preferredDays: giorni preferiti della settimana
 * - averageArrivalTime: orario medio di arrivo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DayCount = {
  [key: string]: number;
};

type TimeSlot = {
  hour: number;
  count: number;
};

async function updateCustomerMetrics() {
  console.log('🔄 Inizio aggiornamento metriche clienti...\n');

  try {
    // 1. Recupera tutti i guest
    const guests = await prisma.guest.findMany({
      include: {
        listEntries: {
          include: {
            list: {
              include: {
                event: true,
              },
            },
          },
        },
        tickets: {
          include: {
            event: true,
            checkins: true,
          },
        },
      } as any,
    }) as any[];

    console.log(`📊 Trovati ${guests.length} clienti da processare\n`);

    let updated = 0;
    let skipped = 0;

    for (const guest of guests) {
      try {
        // Raccogli tutti gli eventi unici a cui ha partecipato
        const eventIds = new Set<string>();
        const checkInDates: Date[] = [];
        const groupSizes: number[] = [];

        // Da list entries
        for (const entry of guest.listEntries) {
          if (entry.list.event) {
            eventIds.add(entry.list.eventId);
          }
        }

        // Da tickets con check-in
        for (const ticket of guest.tickets) {
          if (ticket.checkins && ticket.checkins.length > 0) {
            eventIds.add(ticket.eventId);
            
            // Raccogli date e orari di check-in
            for (const checkin of ticket.checkins) {
              checkInDates.push(new Date(checkin.checkedInAt));
              if (checkin.groupSize) {
                groupSizes.push(checkin.groupSize);
              }
            }
          }
        }

        const totalEvents = eventIds.size;

        // Trova data ultimo evento
        let lastEventDate: Date | null = null;
        
        const allEventDates = [
          ...guest.listEntries.map((e: any) => e.list.event?.dateStart).filter(Boolean),
          ...guest.tickets.map((t: any) => t.event.dateStart).filter(Boolean),
        ] as Date[];

        if (allEventDates.length > 0) {
          lastEventDate = new Date(Math.max(...allEventDates.map(d => d.getTime())));
        }

        // Calcola segmento cliente
        let customerSegment: 'NEW' | 'OCCASIONAL' | 'REGULAR' | 'VIP' | 'DORMANT' = 'NEW';
        
        if (totalEvents === 0) {
          customerSegment = 'NEW';
        } else if (lastEventDate) {
          const daysSinceLastEvent = Math.floor(
            (Date.now() - lastEventDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          // Cliente dormiente se > 90 giorni dall'ultimo evento
          if (daysSinceLastEvent > 90) {
            customerSegment = 'DORMANT';
          } else if (totalEvents >= 10) {
            customerSegment = 'VIP';
          } else if (totalEvents >= 5) {
            customerSegment = 'REGULAR';
          } else if (totalEvents >= 2) {
            customerSegment = 'OCCASIONAL';
          } else {
            customerSegment = 'NEW';
          }
        }

        // Calcola giorni preferiti (basato sui check-in)
        const dayCounts: DayCount = {};
        for (const date of checkInDates) {
          const dayName = date.toLocaleDateString('it-IT', { weekday: 'long' });
          dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
        }

        const preferredDays = Object.entries(dayCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([day]) => day)
          .join(', ');

        // Calcola orario medio di arrivo
        let averageArrivalTime: string | null = null;
        if (checkInDates.length > 0) {
          const totalMinutes = checkInDates.reduce((sum, date) => {
            return sum + date.getHours() * 60 + date.getMinutes();
          }, 0);
          const avgMinutes = Math.floor(totalMinutes / checkInDates.length);
          const hours = Math.floor(avgMinutes / 60);
          const minutes = avgMinutes % 60;
          averageArrivalTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        // Calcola dimensione media gruppo
        const averageGroupSize = groupSizes.length > 0
          ? Math.round(groupSizes.reduce((a, b) => a + b, 0) / groupSizes.length)
          : 1;

        // Aggiorna il guest
        await prisma.guest.update({
          where: { id: guest.id },
          data: {
            totalEvents,
            lastEventDate,
            customerSegment,
            preferredDays: preferredDays || null,
            averageArrivalTime,
            averageGroupSize,
          },
        });

        updated++;
        
        if (updated % 10 === 0) {
          console.log(`✓ Processati ${updated}/${guests.length} clienti...`);
        }

      } catch (error) {
        console.error(`❌ Errore processando guest ${guest.id}:`, error);
        skipped++;
      }
    }

    console.log('\n✅ Aggiornamento completato!');
    console.log(`📈 Statistiche:`);
    console.log(`   - Clienti aggiornati: ${updated}`);
    console.log(`   - Clienti saltati: ${skipped}`);
    console.log(`   - Totale: ${guests.length}`);

    // Mostra distribuzione segmenti
    const segments = await prisma.guest.groupBy({
      by: ['customerSegment'],
      _count: true,
    });

    console.log('\n📊 Distribuzione per segmento:');
    for (const segment of segments) {
      console.log(`   - ${segment.customerSegment}: ${segment._count} clienti`);
    }

  } catch (error) {
    console.error('❌ Errore durante l\'aggiornamento:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  updateCustomerMetrics()
    .then(() => {
      console.log('\n🎉 Script completato con successo!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Script terminato con errori:', error);
      process.exit(1);
    });
}

export { updateCustomerMetrics };
