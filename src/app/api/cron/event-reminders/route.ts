import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendMessage, MessageTemplates, getActiveProviders } from '@/lib/messaging';

/**
 * POST /api/cron/event-reminders
 * Invia promemoria Telegram per eventi nelle prossime 24 ore
 * 
 * Setup Vercel Cron:
 * vercel.json: { "cron": [{ "path": "/api/cron/event-reminders", "schedule": "0 10 * * *" }] }
 */
export async function POST(req: NextRequest) {
  try {
    // Verifica autenticazione cron (opzionale ma consigliato)
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    const activeProviders = getActiveProviders();
    
    if (!activeProviders.includes('telegram')) {
      return NextResponse.json({ 
        success: true,
        message: 'Telegram non configurato, skip reminders',
        sent: 0,
      });
    }

    // Trova eventi nelle prossime 24 ore
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents: any[] = await prisma.event.findMany({
      where: {
        dateStart: {
          gte: now,
          lte: tomorrow,
        },
        status: {
          in: ['DRAFT', 'PUBLISHED'],
        },
      },
      include: {
        tickets: {
          where: {
            status: {
              in: ['NEW', 'USED'],
            },
          },
          include: {
            listEntry: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    } as any);

    let sentCount = 0;
    let errorCount = 0;

    // Per ogni evento, invia reminder ai guests con Telegram collegato
    for (const event of upcomingEvents) {
      const hoursUntil = Math.round((event.dateStart.getTime() - now.getTime()) / (1000 * 60 * 60));
      
      // Raccoglie tutti i listEntryId dai tickets
      const listEntryIds = event.tickets
        .filter((t: any) => t.listEntryId)
        .map((t: any) => t.listEntryId!);

      if (listEntryIds.length === 0) continue;

      // Trova guests con telegramChatId collegato
      const guests: any[] = await prisma.guest.findMany({
        where: {
          listEntries: {
            some: {
              id: {
                in: listEntryIds,
              },
            },
          },
          telegramChatId: {
            not: null,
          },
        },
        select: {
          id: true,
          telegramChatId: true,
          firstName: true,
          lastName: true,
        },
      } as any);

      // Invia reminder a ciascun guest
      for (const guest of guests) {
        try {
          if (guest.telegramChatId) {
            await sendMessage({
              to: guest.telegramChatId,
              message: MessageTemplates.eventReminder(event.title, hoursUntil),
            });

            sentCount++;
            console.log(
              `✅ Reminder inviato a ${guest.firstName} ${guest.lastName} per evento "${event.title}" (tra ${hoursUntil}h)`
            );
          }
        } catch (error) {
          errorCount++;
          console.error(
            `⚠️ Errore invio reminder a guest ${guest.id}:`,
            error
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      eventsProcessed: upcomingEvents.length,
      remindersSent: sentCount,
      errors: errorCount,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Errore cron event-reminders:', error);
    return NextResponse.json(
      { 
        error: 'Errore interno del server',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET per health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    cron: 'event-reminders',
    telegram: getActiveProviders().includes('telegram'),
  });
}
