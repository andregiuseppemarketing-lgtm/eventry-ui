/**
 * Sistema di messaggistica unificato
 * Supporta: Telegram (attivo) + WhatsApp Meta API (preparato)
 * 
 * Setup:
 * 1. Telegram Bot: @BotFather su Telegram → /newbot → copia BOT_TOKEN
 * 2. WhatsApp: Meta Business → WhatsApp API → copia ACCESS_TOKEN (futuro)
 */

import TelegramBot from 'node-telegram-bot-api';

// ==================== CONFIGURAZIONE ====================

const TELEGRAM_ENABLED = !!process.env.TELEGRAM_BOT_TOKEN;
const WHATSAPP_ENABLED = !!process.env.WHATSAPP_ACCESS_TOKEN;

// Telegram Bot (polling disabilitato per produzione - si usa webhook)
let telegramBot: TelegramBot | null = null;
if (TELEGRAM_ENABLED) {
  telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, {
    polling: false, // Usa webhook in produzione
  });
}

// ==================== TIPI ====================

export type MessageProvider = 'telegram' | 'whatsapp';

export interface SendMessageOptions {
  to: string; // telegramChatId o whatsappPhone
  message: string;
  provider?: MessageProvider; // Auto-detect se omesso
  parseMode?: 'Markdown' | 'HTML';
}

export interface SendMediaOptions extends SendMessageOptions {
  media: Buffer;
  caption?: string;
  filename?: string;
}

export interface MessageResult {
  success: boolean;
  provider: MessageProvider;
  messageId?: string;
  error?: string;
}

// ==================== TELEGRAM FUNCTIONS ====================

async function sendTelegramMessage(
  chatId: string,
  message: string,
  parseMode: 'Markdown' | 'HTML' = 'Markdown'
): Promise<MessageResult> {
  if (!telegramBot || !TELEGRAM_ENABLED) {
    return {
      success: false,
      provider: 'telegram',
      error: 'Telegram bot non configurato. Aggiungi TELEGRAM_BOT_TOKEN in .env',
    };
  }

  try {
    const result = await telegramBot.sendMessage(chatId, message, {
      parse_mode: parseMode,
    });

    return {
      success: true,
      provider: 'telegram',
      messageId: String(result.message_id),
    };
  } catch (error: any) {
    console.error('[Telegram] Errore invio messaggio:', error);
    return {
      success: false,
      provider: 'telegram',
      error: error.message || 'Errore sconosciuto',
    };
  }
}

async function sendTelegramPhoto(
  chatId: string,
  photo: Buffer,
  caption?: string
): Promise<MessageResult> {
  if (!telegramBot || !TELEGRAM_ENABLED) {
    return {
      success: false,
      provider: 'telegram',
      error: 'Telegram bot non configurato',
    };
  }

  try {
    const result = await telegramBot.sendPhoto(chatId, photo, {
      caption: caption || '',
      parse_mode: 'Markdown',
    });

    return {
      success: true,
      provider: 'telegram',
      messageId: String(result.message_id),
    };
  } catch (error: any) {
    console.error('[Telegram] Errore invio foto:', error);
    return {
      success: false,
      provider: 'telegram',
      error: error.message,
    };
  }
}

async function sendTelegramDocument(
  chatId: string,
  document: Buffer,
  filename: string,
  caption?: string
): Promise<MessageResult> {
  if (!telegramBot || !TELEGRAM_ENABLED) {
    return {
      success: false,
      provider: 'telegram',
      error: 'Telegram bot non configurato',
    };
  }

  try {
    const result = await telegramBot.sendDocument(
      chatId,
      document,
      {
        caption: caption || '',
        parse_mode: 'Markdown',
      },
      {
        filename,
      }
    );

    return {
      success: true,
      provider: 'telegram',
      messageId: String(result.message_id),
    };
  } catch (error: any) {
    console.error('[Telegram] Errore invio documento:', error);
    return {
      success: false,
      provider: 'telegram',
      error: error.message,
    };
  }
}

// ==================== WHATSAPP FUNCTIONS (PREPARATO) ====================

async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<MessageResult> {
  if (!WHATSAPP_ENABLED) {
    return {
      success: false,
      provider: 'whatsapp',
      error: 'WhatsApp non ancora configurato. Disponibile prossimamente.',
    };
  }

  // TODO: Implementare quando attivi WhatsApp Meta API
  // const WHATSAPP_API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  // const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
  
  // try {
  //   const response = await fetch(WHATSAPP_API_URL, {
  //     method: 'POST',
  //     headers: {
  //       'Authorization': `Bearer ${ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       messaging_product: 'whatsapp',
  //       to: phone,
  //       type: 'text',
  //       text: { body: message },
  //     }),
  //   });
  //
  //   const data = await response.json();
  //   return {
  //     success: true,
  //     provider: 'whatsapp',
  //     messageId: data.messages[0].id,
  //   };
  // } catch (error: any) {
  //   return {
  //     success: false,
  //     provider: 'whatsapp',
  //     error: error.message,
  //   };
  // }

  return {
    success: false,
    provider: 'whatsapp',
    error: 'WhatsApp API non ancora implementata',
  };
}

// ==================== PUBLIC API ====================

/**
 * Invia messaggio di testo (auto-detect provider)
 */
export async function sendMessage(options: SendMessageOptions): Promise<MessageResult> {
  const { to, message, provider, parseMode = 'Markdown' } = options;

  // Auto-detect provider se non specificato
  let detectedProvider: MessageProvider = provider || 'telegram';
  
  if (!provider) {
    // Se inizia con + o numero, potrebbe essere WhatsApp
    if (to.startsWith('+') || /^\d+$/.test(to)) {
      detectedProvider = 'whatsapp';
    }
  }

  if (detectedProvider === 'telegram') {
    return sendTelegramMessage(to, message, parseMode);
  } else {
    return sendWhatsAppMessage(to, message);
  }
}

/**
 * Invia immagine/foto (QR code, biglietto, etc)
 */
export async function sendPhoto(options: SendMediaOptions): Promise<MessageResult> {
  const { to, media, caption, provider } = options;

  const detectedProvider: MessageProvider = provider || 'telegram';

  if (detectedProvider === 'telegram') {
    return sendTelegramPhoto(to, media, caption);
  } else {
    // TODO: Implementare WhatsApp media
    return {
      success: false,
      provider: 'whatsapp',
      error: 'WhatsApp media non ancora implementato',
    };
  }
}

/**
 * Invia documento (PDF, etc)
 */
export async function sendDocument(options: SendMediaOptions): Promise<MessageResult> {
  const { to, media, caption, filename = 'document.pdf', provider } = options;

  const detectedProvider: MessageProvider = provider || 'telegram';

  if (detectedProvider === 'telegram') {
    return sendTelegramDocument(to, media, filename, caption);
  } else {
    // TODO: Implementare WhatsApp document
    return {
      success: false,
      provider: 'whatsapp',
      error: 'WhatsApp document non ancora implementato',
    };
  }
}

/**
 * Get Telegram Bot instance (per webhook)
 */
export function getTelegramBot(): TelegramBot | null {
  return telegramBot;
}

/**
 * Check quali provider sono attivi
 */
export function getActiveProviders(): MessageProvider[] {
  const providers: MessageProvider[] = [];
  if (TELEGRAM_ENABLED) providers.push('telegram');
  if (WHATSAPP_ENABLED) providers.push('whatsapp');
  return providers;
}

// ==================== TEMPLATE MESSAGGI ====================

export const MessageTemplates = {
  ticketConfirmed: (eventTitle: string, eventDate: string, ticketCode: string) => `
🎉 *Biglietto Confermato!*

📅 Evento: *${eventTitle}*
📍 Data: ${eventDate}
🎟️ Codice: \`${ticketCode}\`

Mostra questo QR code all'ingresso.
Ci vediamo presto! 🔥
  `.trim(),

  checkInSuccess: (eventTitle: string, guestName: string) => `
✅ *Check-in Completato!*

Benvenuto/a ${guestName}!
Evento: *${eventTitle}*

Buon divertimento! 🎊
  `.trim(),

  eventReminder: (eventTitle: string, hoursUntil: number) => `
⏰ *Promemoria Evento*

Tra ${hoursUntil} ore inizia:
*${eventTitle}*

Non dimenticare il biglietto! 🎫
  `.trim(),

  welcomeMessage: () => `
✅ *Telegram Collegato!*

Riceverai notifiche per:
🎫 Biglietti confermati
⏰ Promemoria eventi
🎉 Offerte esclusive
🔔 Aggiornamenti importanti

Grazie per averci scelto! 💜
  `.trim(),
};
