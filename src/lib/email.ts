/**
 * Email Service
 * Gestisce l'invio di email tramite Resend
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type EmailTemplate = 
  | 'welcome'
  | 'birthday'
  | 'event-reminder'
  | 'vip-promotion'
  | 're-engagement'
  | 'thank-you';

export interface EmailData {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Renderizza template HTML per email
 */
function renderEmailTemplate(template: EmailTemplate, data: Record<string, any>): string {
  const baseStyle = `
    <style>
      body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
      .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
      .content { padding: 40px 30px; line-height: 1.6; color: #333; }
      .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      .code { background: #f1f3f5; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; font-size: 18px; letter-spacing: 2px; }
    </style>
  `;

  const templates: Record<EmailTemplate, string> = {
    'birthday': `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>🎂 Buon Compleanno ${data.name}!</h1>
        </div>
        <div class="content">
          <p>Caro ${data.name},</p>
          <p>Tutto il team di <strong>EVENTRY</strong> ti augura un fantastico compleanno! 🎉</p>
          ${data.discountCode ? `
            <p>Come regalo speciale, abbiamo preparato per te un codice sconto esclusivo VIP:</p>
            <div class="code">${data.discountCode}</div>
            <p>Utilizzalo al prossimo evento per ricevere vantaggi esclusivi!</p>
          ` : '<p>Ci auguriamo di vederti presto ai nostri eventi! 🎊</p>'}
          <p>A presto,<br>Il Team EVENTRY</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 EVENTRY. Tutti i diritti riservati.</p>
        </div>
      </div>
    `,
    
    'vip-promotion': `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>⭐ Congratulazioni ${data.name}!</h1>
        </div>
        <div class="content">
          <p>Caro ${data.name},</p>
          <p>Siamo entusiasti di informarti che sei stato promosso a <strong>Cliente VIP</strong>! 🌟</p>
          <p>Grazie alla tua fedeltà (${data.totalEvents} eventi partecipati), ora hai accesso a vantaggi esclusivi:</p>
          <ul>
            <li>🎫 Ingresso prioritario a tutti gli eventi</li>
            <li>🍸 Cocktail omaggio ad ogni evento</li>
            <li>📅 Prenotazione tavoli con 48h di anticipo</li>
            <li>🎁 Sconti esclusivi per eventi speciali</li>
            <li>💌 Inviti anticipati alle novità</li>
            <li>⭐ Supporto WhatsApp dedicato</li>
          </ul>
          <p>Continua a far parte della famiglia EVENTRY!</p>
          <a href="${data.dashboardUrl}" class="button">Vai alla Dashboard</a>
          <p>A presto,<br>Il Team EVENTRY</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 EVENTRY. Tutti i diritti riservati.</p>
        </div>
      </div>
    `,
    
    're-engagement': `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>💫 Ci manchi ${data.name}!</h1>
        </div>
        <div class="content">
          <p>Caro ${data.name},</p>
          <p>Sono passati un po' di giorni dall'ultima volta che ci siamo visti... ci manchi! 😢</p>
          <p>Abbiamo preparato qualcosa di speciale per te:</p>
          <div class="code">${data.offer}</div>
          <p>Torna a trovarci e scopri tutti i nuovi eventi in programma!</p>
          <a href="${data.eventsUrl}" class="button">Scopri gli Eventi</a>
          <p>Non vediamo l'ora di rivederti,<br>Il Team EVENTRY</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 EVENTRY. Tutti i diritti riservati.</p>
        </div>
      </div>
    `,
    
    'welcome': `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>🎉 Benvenuto ${data.name}!</h1>
        </div>
        <div class="content">
          <p>Ciao ${data.name},</p>
          <p>Benvenuto in <strong>EVENTRY</strong>! Siamo felici di averti con noi. 🎊</p>
          <p>Inizia subito a esplorare i nostri eventi e scopri tutte le novità!</p>
          <a href="${data.loginUrl}" class="button">Accedi Ora</a>
          <p>A presto,<br>Il Team PANICO</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 PANICO App. Tutti i diritti riservati.</p>
        </div>
      </div>
    `,
    
    'event-reminder': `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>📅 Promemoria Evento</h1>
        </div>
        <div class="content">
          <p>Ciao ${data.name},</p>
          <p>Ti ricordiamo che l'evento <strong>${data.eventTitle}</strong> si terrà:</p>
          <p><strong>📅 Data:</strong> ${data.eventDate}<br>
          <strong>📍 Luogo:</strong> ${data.venueName}</p>
          <p>Non vediamo l'ora di vederti!</p>
          <a href="${data.eventUrl}" class="button">Dettagli Evento</a>
          <p>A presto,<br>Il Team PANICO</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 PANICO App. Tutti i diritti riservati.</p>
        </div>
      </div>
    `,
    
    'thank-you': `
      ${baseStyle}
      <div class="container">
        <div class="header">
          <h1>🙏 Grazie ${data.name}!</h1>
        </div>
        <div class="content">
          <p>Caro ${data.name},</p>
          <p>Grazie per aver partecipato a <strong>${data.eventTitle}</strong>! 🎉</p>
          <p>Speriamo ti sia divertito e che tornerai presto a trovarci.</p>
          <p>Continua a seguirci per non perdere i prossimi eventi!</p>
          <a href="${data.eventsUrl}" class="button">Prossimi Eventi</a>
          <p>A presto,<br>Il Team PANICO</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 PANICO App. Tutti i diritti riservati.</p>
        </div>
      </div>
    `,
  };

  return templates[template] || '';
}

/**
 * Invia email usando Resend
 */
export async function sendEmail(emailData: EmailData): Promise<EmailResult> {
  try {
    // In development, logga invece di inviare
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 [Email Dev Mode]', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        data: emailData.data,
      });
      return {
        success: true,
        messageId: `dev-${Date.now()}`,
      };
    }

    // Verifica configurazione Resend
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn('[Email] Resend non configurato, email non inviata');
      return {
        success: false,
        error: 'Resend API key non configurata',
      };
    }

    // Renderizza template
    const html = renderEmailTemplate(emailData.template, emailData.data);

    // Invia con Resend
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'EVENTRY <noreply@eventry.app>',
      to: emailData.to,
      subject: emailData.subject,
      html,
    });

    if (result.error) {
      console.error('[Email] Errore Resend:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    console.log('[Email] Inviata con successo:', result.data?.id);
    return {
      success: true,
      messageId: result.data?.id,
    };

  } catch (error) {
    console.error('[Email] Errore invio:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Invia email di benvenuto
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: '🎉 Benvenuto in EVENTRY!',
    template: 'welcome',
    data: {
      name,
      loginUrl: `${process.env.NEXTAUTH_URL}/auth/login`,
    },
  });
}

/**
 * Invia email di compleanno
 */
export async function sendBirthdayEmail(
  email: string,
  name: string,
  discountCode?: string
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: '🎂 Buon Compleanno da EVENTRY!',
    template: 'birthday',
    data: {
      name,
      discountCode,
      eventsUrl: `${process.env.NEXTAUTH_URL}/eventi`,
    },
  });
}

/**
 * Invia promemoria evento
 */
export async function sendEventReminderEmail(
  email: string,
  name: string,
  eventName: string,
  eventDate: Date,
  ticketUrl: string
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: `📅 Promemoria: ${eventName}`,
    template: 'event-reminder',
    data: {
      name,
      eventName,
      eventDate: eventDate.toLocaleDateString('it-IT', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      eventTime: eventDate.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      ticketUrl,
    },
  });
}

/**
 * Invia email di promozione VIP
 */
export async function sendVIPPromotionEmail(
  email: string,
  name: string,
  benefits: string[]
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: '⭐ Congratulazioni! Sei diventato VIP',
    template: 'vip-promotion',
    data: {
      name,
      benefits,
      vipUrl: `${process.env.NEXTAUTH_URL}/vip`,
    },
  });
}

/**
 * Invia email di re-engagement per clienti dormienti
 */
export async function sendReEngagementEmail(
  email: string,
  name: string,
  offer: string,
  lastEventDate?: Date | null
): Promise<EmailResult> {
  const daysSince = lastEventDate
    ? Math.floor((Date.now() - new Date(lastEventDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return sendEmail({
    to: email,
    subject: '💫 Ci manchi! Torna da EVENTRY',
    template: 're-engagement',
    data: {
      name,
      offer,
      daysSince,
      eventsUrl: `${process.env.NEXTAUTH_URL}/eventi`,
    },
  });
}

/**
 * Invia email di ringraziamento post-evento
 */
export async function sendThankYouEmail(
  email: string,
  name: string,
  eventName: string,
  feedbackUrl: string
): Promise<EmailResult> {
  return sendEmail({
    to: email,
    subject: `🙏 Grazie per aver partecipato a ${eventName}`,
    template: 'thank-you',
    data: {
      name,
      eventName,
      feedbackUrl,
      nextEventsUrl: `${process.env.NEXTAUTH_URL}/eventi`,
    },
  });
}

/**
 * Invia email di reset password
 */
export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string
): Promise<EmailResult> {
  if (!resend) {
    console.warn('[Email] Resend not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Event IQ <onboarding@resend.dev>',
      to: email,
      subject: '🔐 Event IQ - Reset Password',
      html: `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background:#f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:28px;">🎟️ Event IQ</h1>
        </td></tr>
        <tr><td style="padding:40px 30px;">
          <h2 style="margin:0 0 20px;color:#333;font-size:24px;">Ciao ${firstName || 'Utente'},</h2>
          <p style="margin:0 0 20px;color:#666;font-size:16px;line-height:1.6;">
            Hai richiesto di reimpostare la password del tuo account Event IQ.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:0 0 30px;">
              <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;text-decoration:none;padding:15px 40px;border-radius:6px;font-size:16px;font-weight:600;">
                Reimposta Password
              </a>
            </td></tr>
          </table>
          <p style="margin:0 0 10px;color:#999;font-size:14px;">Oppure copia questo link:</p>
          <p style="margin:0 0 30px;padding:15px;background:#f8f9fa;border-radius:4px;word-break:break-all;font-size:13px;color:#667eea;">
            ${resetUrl}
          </p>
          <div style="border-left:4px solid #fbbf24;padding-left:15px;margin:30px 0;">
            <p style="margin:0;color:#b45309;font-size:14px;font-weight:600;">⚠️ Importante:</p>
            <p style="margin:5px 0 0;color:#92400e;font-size:13px;">
              Link valido per <strong>1 ora</strong>. Se non hai richiesto il reset, ignora questa email.
            </p>
          </div>
        </td></tr>
        <tr><td style="background:#f8f9fa;padding:25px 30px;text-align:center;border-top:1px solid #e5e7eb;">
          <p style="margin:0;color:#999;font-size:12px;">© ${new Date().getFullYear()} Event IQ</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    });

    if (error) {
      console.error('[Email] Password reset error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Password reset sent to:', email);
    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error('[Email] Error:', error);
    return { success: false, error: String(error) };
  }
}
