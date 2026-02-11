import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// Tipo esplicito per CheckIn con tutte le relazioni necessarie
type CheckInData = Prisma.CheckInGetPayload<{
  include: {
    ticket: {
      include: {
        guest: true;
        listEntry: {
          include: {
            list: true;
          };
        };
      };
    };
  };
}>;

/**
 * GET /api/dashboard/evento/[id]
 * 
 * Dashboard completa organizzatore per evento singolo
 * Ritorna dati aggregati: KPI, timeline, distribuzione pubblico, performance PR
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const { id: eventId } = await params;

    // Filtri opzionali
    const { searchParams } = new URL(request.url);
    const startTime = searchParams.get('startTime'); // es: "22:00"
    const endTime = searchParams.get('endTime');     // es: "03:00"
    const listId = searchParams.get('listId');      // filtro per lista specifica

    // 1. Recupera info evento
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        dateStart: true,
        venue: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      );
    }

    // 2. Recupera tutti i check-in dell'evento con relazioni
    // @ts-ignore - Prisma TypeScript inferenza issue con relazioni annidate
    const checkIns: CheckInData[] = await prisma.checkIn.findMany({
      where: {
        ticket: {
          eventId,
        },
      },
      include: {
        ticket: {
          include: {
            guest: true,
            listEntry: {
              include: {
                list: true,
              },
            },
          } as any,
        },
      },
      orderBy: {
        scannedAt: 'asc',
      },
    });

    // Filtra per orario se specificato
    let filteredCheckIns = checkIns;
    if (startTime || endTime) {
      filteredCheckIns = checkIns.filter(checkin => {
        const hour = new Date(checkin.scannedAt).getHours();
        const minute = new Date(checkin.scannedAt).getMinutes();
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (startTime && endTime) {
          return timeString >= startTime && timeString <= endTime;
        } else if (startTime) {
          return timeString >= startTime;
        } else if (endTime) {
          return timeString <= endTime;
        }
        return true;
      });
    }

    // Filtra per lista se specificato
    if (listId) {
      filteredCheckIns = filteredCheckIns.filter(
        checkin => checkin.ticket.listEntry?.listId === listId
      );
    }

    // 3. CALCOLO METRICHE
    
    // A. OVERVIEW KPI
    const totalEntries = filteredCheckIns.length;
    const guestIds = new Set(
      filteredCheckIns
        // @ts-ignore
        .map(c => c.ticket.guestId)
        .filter(Boolean)
    );
    const newCustomers = filteredCheckIns.filter(c => {
      // @ts-ignore
      const guest = c.ticket.guest as any;
      return guest && guest.totalEvents === 1;
    }).length;
    const returningCustomers = totalEntries - newCustomers;
    
    // Query consumazioni
    const consumptions = await prisma.consumption.findMany({
      where: { eventId },
      select: {
        id: true,
        amount: true,
        category: true,
        items: true,
        createdAt: true,
      },
    });

    const totalTicketRevenue = filteredCheckIns.reduce(
      (sum, checkin) => sum + (checkin.ticket.price || 0),
      0
    );
    const totalConsumptionsRevenue = consumptions.reduce(
      (sum, c) => sum + c.amount,
      0
    );
    const totalRevenue = totalTicketRevenue + totalConsumptionsRevenue;
    const avgRevenuePerPerson = totalEntries > 0 ? totalRevenue / totalEntries : 0;
    const avgGroupSize = totalEntries > 0
      ? filteredCheckIns.reduce((sum, c) => sum + c.groupSize, 0) / totalEntries
      : 0;

    // Calcola orario di picco (fascia 30 minuti)
    const timeSlotMap = new Map<string, number>();
    filteredCheckIns.forEach(checkin => {
      const date = new Date(checkin.scannedAt);
      const hour = date.getHours();
      const minutes = Math.floor(date.getMinutes() / 30) * 30;
      const slot = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      timeSlotMap.set(slot, (timeSlotMap.get(slot) || 0) + 1);
    });
    
    let peakTimeSlot = '22:00';
    let peakCount = 0;
    timeSlotMap.forEach((count, slot) => {
      if (count > peakCount) {
        peakCount = count;
        peakTimeSlot = slot;
      }
    });

    // B. TIMELINE (30 minuti da 22:00 a 05:00)
    const timeSlots: Array<{ time: string; entries: number; cumulative: number }> = [];
    let cumulative = 0;
    
    for (let h = 22; h <= 29; h++) { // 22-29 per coprire 22:00-05:00
      for (let m = 0; m < 60; m += 30) {
        const actualHour = h % 24;
        const slot = `${actualHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const entries = timeSlotMap.get(slot) || 0;
        cumulative += entries;
        timeSlots.push({ time: slot, entries, cumulative });
        
        if (actualHour === 5 && m === 0) break;
      }
      if (h === 29) break;
    }

    // C. ANALISI PUBBLICO
    
    // Età
    const ageDistribution: Record<string, number> = {
      '18-21': 0,
      '22-25': 0,
      '26-30': 0,
      '31-35': 0,
      '35+': 0,
      'unknown': 0,
    };
    let totalAge = 0;
    let ageCount = 0;
    
    filteredCheckIns.forEach(checkin => {
      // @ts-ignore
      const guest = checkin.ticket.guest as any;
      if (guest?.birthDate) {
        const age = new Date().getFullYear() - new Date(guest.birthDate).getFullYear();
        totalAge += age;
        ageCount++;
        
        if (age >= 18 && age <= 21) ageDistribution['18-21']++;
        else if (age >= 22 && age <= 25) ageDistribution['22-25']++;
        else if (age >= 26 && age <= 30) ageDistribution['26-30']++;
        else if (age >= 31 && age <= 35) ageDistribution['31-35']++;
        else if (age > 35) ageDistribution['35+']++;
      } else {
        ageDistribution['unknown']++;
      }
    });
    
    const avgAge = ageCount > 0 ? totalAge / ageCount : null;

    // Genere (placeholder - attualmente non tracciato completamente)
    const genderDistribution: Record<string, number> = {
      M: 0,
      F: 0,
      unknown: totalEntries,
    };

    // Città
    const cityMap = new Map<string, number>();
    filteredCheckIns.forEach(checkin => {
      // @ts-ignore
      const city = checkin.ticket.guest?.city;
      if (city) {
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      }
    });
    
    const topCities = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const outOfTownPercentage = totalEntries > 0
      ? ((totalEntries - (cityMap.get(event.venue.name) || 0)) / totalEntries) * 100
      : 0;

    // D. PERFORMANCE PR (basato sulle liste)
    const listStatsMap = new Map<string, {
      listName: string;
      entries: number;
      revenue: number;
      avgGroupSize: number;
      tickets: {
        lista: number;
        tavolo: number;
        prevendita: number;
        omaggio: number;
      };
    }>();

    filteredCheckIns.forEach(checkin => {
      const listEntry = checkin.ticket.listEntry;
      const list = listEntry?.list;
      
      if (!list) return;
      
      const listId = list.id;
      if (!listStatsMap.has(listId)) {
        listStatsMap.set(listId, {
          listName: list.name,
          entries: 0,
          revenue: 0,
          avgGroupSize: 0,
          tickets: {
            lista: 0,
            tavolo: 0,
            prevendita: 0,
            omaggio: 0,
          },
        });
      }
      
      const stats = listStatsMap.get(listId)!;
      stats.entries++;
      stats.revenue += checkin.ticket.price || 0;
      stats.avgGroupSize += checkin.groupSize;
      
      // Conta tipologie ticket
      const ticketType = checkin.ticket.type.toLowerCase();
      if (ticketType === 'list') stats.tickets.lista++;
      else if (ticketType === 'table') stats.tickets.tavolo++;
      else if (ticketType === 'presale') stats.tickets.prevendita++;
      else if (ticketType === 'free') stats.tickets.omaggio++;
    });

    // Calcola media gruppo e ordina
    const prPerformance = Array.from(listStatsMap.values())
      .map(stats => ({
        prName: stats.listName,
        prInstagram: null, // TODO: aggiungere quando avremo prProfileId sulla lista
        entries: stats.entries,
        revenue: stats.revenue,
        avgGroupSize: stats.entries > 0 ? stats.avgGroupSize / stats.entries : 0,
        tickets: stats.tickets,
      }))
      .sort((a, b) => b.entries - a.entries);

    const topPr = prPerformance.length > 0
      ? {
          name: prPerformance[0].prName,
          instagram: prPerformance[0].prInstagram,
          entries: prPerformance[0].entries,
          percentage: totalEntries > 0 
            ? Math.round((prPerformance[0].entries / totalEntries) * 100)
            : 0,
        }
      : null;

    // E. MONETIZZAZIONE
    const ticketTypeDistribution: Record<string, number> = {
      lista: 0,
      tavolo: 0,
      prevendita: 0,
      omaggio: 0,
      vip: 0,
    };
    const revenueByType: Record<string, number> = {
      lista: 0,
      tavolo: 0,
      prevendita: 0,
      omaggio: 0,
      vip: 0,
    };

    filteredCheckIns.forEach(checkin => {
      const ticketType = checkin.ticket.type.toLowerCase();
      const price = checkin.ticket.price || 0;
      
      if (ticketType === 'list') {
        ticketTypeDistribution.lista++;
        revenueByType.lista += price;
      } else if (ticketType === 'table') {
        ticketTypeDistribution.tavolo++;
        revenueByType.tavolo += price;
      } else if (ticketType === 'presale') {
        ticketTypeDistribution.prevendita++;
        revenueByType.prevendita += price;
      } else if (ticketType === 'free') {
        ticketTypeDistribution.omaggio++;
        revenueByType.omaggio += price;
      } else if (ticketType === 'vip') {
        ticketTypeDistribution.vip++;
        revenueByType.vip += price;
      }
    });

    const ticketTypePercentages: Record<string, number> = {};
    Object.keys(ticketTypeDistribution).forEach(type => {
      ticketTypePercentages[type] = totalEntries > 0
        ? (ticketTypeDistribution[type] / totalEntries) * 100
        : 0;
    });

    // RISPOSTA FINALE
    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        date: event.dateStart,
        venue: event.venue.name,
      },
      overview: {
        totalEntries,
        newCustomers,
        returningCustomers,
        totalRevenue,
        totalTicketRevenue,
        totalConsumptionsRevenue,
        avgRevenuePerPerson,
        avgGroupSize,
        peakTimeSlot,
        peakCount,
      },
      timeline: timeSlots,
      audience: {
        ageDistribution,
        avgAge,
        genderDistribution,
        topCities,
        outOfTownPercentage,
      },
      prPerformance,
      topPr,
      monetization: {
        totalRevenue,
        ticketRevenue: totalTicketRevenue,
        consumptionsRevenue: totalConsumptionsRevenue,
        ticketTypeDistribution,
        ticketTypePercentages,
        revenueByType,
      },
      consumptions: {
        total: consumptions.length,
        revenue: totalConsumptionsRevenue,
        avgPerConsumption: consumptions.length > 0 ? totalConsumptionsRevenue / consumptions.length : 0,
        byCategory: consumptions.reduce((acc, c) => {
          acc[c.category] = (acc[c.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        revenueByCategory: consumptions.reduce((acc, c) => {
          acc[c.category] = (acc[c.category] || 0) + c.amount;
          return acc;
        }, {} as Record<string, number>),
      },
    });

  } catch (error) {
    console.error('Errore dashboard evento:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
