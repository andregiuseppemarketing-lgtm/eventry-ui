/**
 * Telegram Bot Webhook
 * Gestisce messaggi in arrivo dal bot Telegram
 * 
 * Funzioni:
 * - /start guest_XXXXX → Collega Telegram chatId al guest
 * - /help → Mostra comandi disponibili
 * - /mybiglietti → Lista biglietti attivi
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTelegramBot, sendMessage, MessageTemplates } from '@/lib/messaging';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const bot = getTelegramBot();
    
    if (!bot) {
      return NextResponse.json(
        { error: 'Telegram bot non configurato' },
        { status: 503 }
      );
    }

    const update = await request.json();
    console.log('[Telegram Webhook] Update ricevuto:', JSON.stringify(update, null, 2));

    // Gestisci messaggio
    if (update.message) {
      const message = update.message;
      const chatId = String(message.chat.id);
      const text = message.text || '';
      const firstName = message.from?.first_name || 'Utente';

      // Comando /start con parametro deep linking
      if (text.startsWith('/start')) {
        const params = text.split(' ');
        
        if (params.length > 1 && params[1].startsWith('guest_')) {
          // Collegamento account
          const guestId = params[1].replace('guest_', '');
          
          try {
            const guest: any = await prisma.guest.update({
              where: { id: guestId },
              data: { telegramChatId: chatId } as any,
            });

            await sendMessage({
              to: chatId,
              message: MessageTemplates.welcomeMessage(),
            });

            console.log(`[Telegram] Guest ${guest.firstName} ${guest.lastName} collegato (chatId: ${chatId})`);
          } catch (error) {
            console.error('[Telegram] Errore collegamento guest:', error);
            await sendMessage({
              to: chatId,
              message: '❌ Errore nel collegamento account. Riprova più tardi.',
            });
          }
        } else {
          // /start normale (senza parametri)
          await sendMessage({
            to: chatId,
            message: `👋 Ciao ${firstName}!\n\nPer collegare il tuo account, clicca sul link che trovi nella tua area personale.`,
          });
        }
      }

      // Comando /help
      else if (text === '/help') {
        await sendMessage({
          to: chatId,
          message: `
📱 *Comandi Disponibili*

/start - Collega account
/mybiglietti - Vedi biglietti attivi
/help - Mostra questo messaggio

Per assistenza, contattaci dal sito.
          `.trim(),
        });
      }

      // Comando /mybiglietti
      else if (text === '/mybiglietti') {
        try {
          const guest: any = await prisma.guest.findFirst({
            where: { telegramChatId: chatId } as any,
            include: {
              tickets: {
                where: {
                  status: { in: ['NEW', 'USED'] },
                },
                include: {
                  event: {
                    select: {
                      id: true,
                      title: true,
                      dateStart: true,
                    },
                  },
                },
                orderBy: {
                  event: {
                    dateStart: 'asc',
                  },
                },
              },
            } as any,
          }) as any;

          if (!guest) {
            await sendMessage({
              to: chatId,
              message: '❌ Account non collegato. Usa /start per collegare il tuo account.',
            });
            return NextResponse.json({ ok: true });
          }

          if (guest.tickets.length === 0) {
            await sendMessage({
              to: chatId,
              message: '📭 Non hai biglietti attivi al momento.',
            });
          } else {
            let ticketsList = '🎟️ *I Tuoi Biglietti*\n\n';
            
            guest.tickets.forEach((ticket: any, index: number) => {
              const eventDate = new Date(ticket.event.dateStart).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              
              ticketsList += `${index + 1}. *${ticket.event.title}*\n`;
              ticketsList += `   📅 ${eventDate}\n`;
              ticketsList += `   🎫 Codice: \`${ticket.code}\`\n`;
              ticketsList += `   ${ticket.status === 'USED' ? '✅ Usato' : '🟢 Attivo'}\n\n`;
            });

            await sendMessage({
              to: chatId,
              message: ticketsList.trim(),
            });
          }
        } catch (error) {
          console.error('[Telegram] Errore recupero biglietti:', error);
          await sendMessage({
            to: chatId,
            message: '❌ Errore nel recupero biglietti. Riprova più tardi.',
          });
        }
      }

      // Messaggio non riconosciuto
      else {
        await sendMessage({
          to: chatId,
          message: `Ciao ${firstName}! 👋\n\nUsa /help per vedere i comandi disponibili.`,
        });
      }
    }

    // Callback query (bottoni inline)
    else if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const chatId = String(callbackQuery.message.chat.id);
      const data = callbackQuery.data;

      // Qui puoi gestire azioni da bottoni inline
      console.log('[Telegram] Callback query:', data);

      // Conferma ricezione callback
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: 'Ricevuto!',
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook] Errore:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET per verifica webhook attivo
export async function GET() {
  const bot = getTelegramBot();
  
  if (!bot) {
    return NextResponse.json({ 
      status: 'disabled',
      message: 'Bot non configurato. Aggiungi TELEGRAM_BOT_TOKEN in .env' 
    });
  }

  return NextResponse.json({ 
    status: 'active',
    message: 'Telegram webhook attivo' 
  });
}
