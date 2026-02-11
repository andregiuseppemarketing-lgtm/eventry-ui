import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/general
 * 
 * Dashboard generale aggregata per tutti gli eventi
 * Supporta filtri: period (month, year, all), month (1-12), year (YYYY)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session || !['ORGANIZER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month'; // 'month', 'year', 'all'
    const monthParam = searchParams.get('month'); // 1-12
    const yearParam = searchParams.get('year'); // YYYY

    const currentDate = new Date();
    const currentMonth = monthParam ? parseInt(monthParam) : currentDate.getMonth() + 1;
    const currentYear = yearParam ? parseInt(yearParam) : currentDate.getFullYear();

    // Calcola date range in base al periodo
    let startDate: Date;
    let endDate: Date;

    if (period === 'month') {
      // Mese specifico
      startDate = new Date(currentYear, currentMonth - 1, 1);
      endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);
    } else if (period === 'year') {
      // Anno specifico
      startDate = new Date(currentYear, 0, 1);
      endDate = new Date(currentYear, 11, 31, 23, 59, 59);
    } else {
      // Tutti i dati
      startDate = new Date(2020, 0, 1); // Inizio arbitrario
      endDate = new Date(2030, 11, 31); // Fine arbitraria
    }

    // 1. Eventi nel periodo
    const events = await prisma.event.findMany({
      where: {
        dateStart: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        title: true,
        dateStart: true,
        status: true,
      },
    });

    const eventIds = events.map(e => e.id);

    if (eventIds.length === 0) {
      return NextResponse.json({
        period: {
          type: period,
          month: period === 'month' ? currentMonth : null,
          year: currentYear,
          startDate,
          endDate,
        },
        overview: {
          totalEvents: 0,
          totalEntries: 0,
          totalRevenue: 0,
          avgEntriesPerEvent: 0,
          avgRevenuePerEvent: 0,
          avgRevenuePerPerson: 0,
          totalNewCustomers: 0,
          totalReturningCustomers: 0,
          avgGroupSize: 0,
        },
        eventsBreakdown: [],
        timeline: [],
        audience: {
          ageDistribution: {},
          avgAge: null,
          topCities: [],
          outOfTownPercentage: 0,
        },
        monetization: {
          totalRevenue: 0,
          ticketTypeDistribution: {},
          revenueByType: {},
        },
        topEvents: [],
        monthlyTrend: [],
      });
    }

    // 2. Check-ins aggregati
    const checkIns = await prisma.checkIn.findMany({
      where: {
        ticket: {
          eventId: {
            in: eventIds,
          },
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
          },
        },
      },
      orderBy: {
        scannedAt: 'asc',
      },
    });

    // 3. CALCOLO METRICHE AGGREGATE

    // Query consumazioni
    const consumptions = await prisma.consumption.findMany({
      where: {
        eventId: {
          in: eventIds,
        },
      },
      select: {
        id: true,
        eventId: true,
        amount: true,
        category: true,
        createdAt: true,
      },
    });

    const totalEntries = checkIns.length;
    
    // @ts-ignore
    const totalTicketRevenue = checkIns.reduce((sum, c) => sum + (c.ticket.price || 0), 0);
    const totalConsumptionsRevenue = consumptions.reduce((sum, c) => sum + c.amount, 0);
    const totalRevenue = totalTicketRevenue + totalConsumptionsRevenue;
    
    const avgEntriesPerEvent = events.length > 0 ? totalEntries / events.length : 0;
    const avgRevenuePerEvent = events.length > 0 ? totalRevenue / events.length : 0;
    const avgRevenuePerPerson = totalEntries > 0 ? totalRevenue / totalEntries : 0;

    // Nuovi vs Ritorno
    const newCustomers = checkIns.filter(c => {
      // @ts-ignore
      const guest = c.ticket.guest;
      return guest && guest.totalEvents === 1;
    }).length;
    const returningCustomers = totalEntries - newCustomers;

    // Gruppo medio
    const avgGroupSize = totalEntries > 0
      ? checkIns.reduce((sum, c) => sum + c.groupSize, 0) / totalEntries
      : 0;

    // 4. BREAKDOWN PER EVENTO
    const eventStatsMap = new Map<string, {
      eventId: string;
      eventTitle: string;
      eventDate: Date;
      entries: number;
      revenue: number;
      newCustomers: number;
    }>();

    checkIns.forEach(checkin => {
      // @ts-ignore
      const eventId = checkin.ticket.eventId;
      const event = events.find(e => e.id === eventId);
      
      if (!event) return;

      if (!eventStatsMap.has(eventId)) {
        eventStatsMap.set(eventId, {
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.dateStart,
          entries: 0,
          revenue: 0,
          newCustomers: 0,
        });
      }

      const stats = eventStatsMap.get(eventId)!;
      stats.entries++;
      // @ts-ignore
      stats.revenue += checkin.ticket.price || 0;
      
      // @ts-ignore
      const guest = checkin.ticket.guest;
      if (guest && guest.totalEvents === 1) {
        stats.newCustomers++;
      }
    });

    const eventsBreakdown = Array.from(eventStatsMap.values())
      .sort((a, b) => b.entries - a.entries);

    // 5. TIMELINE AGGREGATA (per giorno se mese, per mese se anno)
    const timelineMap = new Map<string, number>();
    
    checkIns.forEach(checkin => {
      const date = new Date(checkin.scannedAt);
      let key: string;
      
      if (period === 'month') {
        // Aggrega per giorno
        key = `${date.getDate()}/${currentMonth}`;
      } else if (period === 'year') {
        // Aggrega per mese
        key = `${date.getMonth() + 1}/${currentYear}`;
      } else {
        // Aggrega per mese
        key = `${date.getMonth() + 1}/${date.getFullYear()}`;
      }
      
      timelineMap.set(key, (timelineMap.get(key) || 0) + 1);
    });

    const timeline = Array.from(timelineMap.entries())
      .map(([date, entries]) => ({ date, entries }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 6. ANALISI PUBBLICO AGGREGATA

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

    checkIns.forEach(checkin => {
      // @ts-ignore
      const guest = checkin.ticket.guest;
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

    // Città
    const cityMap = new Map<string, number>();
    checkIns.forEach(checkin => {
      // @ts-ignore
      const city = checkin.ticket.guest?.city;
      if (city) {
        cityMap.set(city, (cityMap.get(city) || 0) + 1);
      }
    });

    const topCities = Array.from(cityMap.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const outOfTownPercentage = totalEntries > 0
      ? ((totalEntries - (topCities[0]?.count || 0)) / totalEntries) * 100
      : 0;

    // 7. MONETIZZAZIONE AGGREGATA
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

    checkIns.forEach(checkin => {
      // @ts-ignore
      const ticketType = checkin.ticket.type.toLowerCase();
      // @ts-ignore
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

    // 8. TOP EVENTI
    const topEvents = eventsBreakdown.slice(0, 5).map(e => ({
      id: e.eventId,
      title: e.eventTitle,
      date: e.eventDate,
      entries: e.entries,
      revenue: e.revenue,
    }));

    // 9. TREND MENSILE (ultimi 12 mesi se year o all)
    const monthlyTrend: Array<{ month: string; entries: number; revenue: number }> = [];
    
    if (period === 'year' || period === 'all') {
      for (let m = 0; m < 12; m++) {
        const monthKey = `${m + 1}/${currentYear}`;
        const monthCheckIns = checkIns.filter(c => {
          const date = new Date(c.scannedAt);
          return date.getFullYear() === currentYear && date.getMonth() === m;
        });
        
        monthlyTrend.push({
          month: monthKey,
          entries: monthCheckIns.length,
          // @ts-ignore
          revenue: monthCheckIns.reduce((sum, c) => sum + (c.ticket.price || 0), 0),
        });
      }
    }

    // RISPOSTA FINALE
    return NextResponse.json({
      period: {
        type: period,
        month: period === 'month' ? currentMonth : null,
        year: currentYear,
        startDate,
        endDate,
      },
      overview: {
        totalEvents: events.length,
        totalEntries,
        totalRevenue,
        totalTicketRevenue,
        totalConsumptionsRevenue,
        avgEntriesPerEvent,
        avgRevenuePerEvent,
        avgRevenuePerPerson,
        totalNewCustomers: newCustomers,
        totalReturningCustomers: returningCustomers,
        avgGroupSize,
      },
      eventsBreakdown,
      timeline,
      audience: {
        ageDistribution,
        avgAge,
        topCities,
        outOfTownPercentage,
      },
      monetization: {
        totalRevenue,
        ticketRevenue: totalTicketRevenue,
        consumptionsRevenue: totalConsumptionsRevenue,
        ticketTypeDistribution,
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
      topEvents,
      monthlyTrend,
    });

  } catch (error) {
    console.error('Errore dashboard generale:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
