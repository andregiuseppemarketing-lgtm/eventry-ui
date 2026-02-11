/**
 * Email Templates per Identity Verification
 * Template pronti per l'invio con sistema email esistente
 */

export interface IdentityVerificationEmailData {
  userName: string;
  userEmail: string;
  documentType: string;
  submittedAt: string;
  verificationId: string;
}

export interface IdentityApprovedEmailData {
  userName: string;
  approvedAt: string;
}

export interface IdentityRejectedEmailData {
  userName: string;
  rejectedAt: string;
  rejectionReason: string;
}

/**
 * Email: Richiesta di verifica ricevuta (inviata all'utente)
 */
export function getVerificationSubmittedTemplate(data: IdentityVerificationEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, documentType, submittedAt } = data;

  const subject = '📋 Richiesta di Verifica Identità Ricevuta';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Richiesta Ricevuta</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Richiesta Ricevuta</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Ciao <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Abbiamo ricevuto la tua richiesta di verifica identità. Il nostro team la esaminerà entro <strong>24-48 ore</strong>.
              </p>
              
              <table width="100%" cellpadding="15" cellspacing="0" style="background-color: #27272a; border-radius: 8px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Tipo Documento</p>
                    <p style="margin: 5px 0 0; color: #ffffff; font-size: 16px; font-weight: 600;">${documentType}</p>
                  </td>
                  <td>
                    <p style="margin: 0; color: #71717a; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Data Invio</p>
                    <p style="margin: 5px 0 0; color: #ffffff; font-size: 16px; font-weight: 600;">${submittedAt}</p>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #3f3f46; border-left: 4px solid #eab308; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; color: #fbbf24; font-size: 14px; line-height: 1.6;">
                  <strong>⏳ Cosa succede ora?</strong><br>
                  Il nostro team verificherà i tuoi documenti manualmente per garantire la massima sicurezza. Riceverai una notifica via email appena il processo sarà completato.
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                I tuoi documenti sono protetti e saranno eliminati automaticamente dopo 90 giorni dall'approvazione, in conformità con il GDPR.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #09090b; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} Panico App. Tutti i diritti riservati.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Ciao ${userName},

Abbiamo ricevuto la tua richiesta di verifica identità.

Tipo Documento: ${documentType}
Data Invio: ${submittedAt}

Il nostro team esaminerà la tua richiesta entro 24-48 ore. Riceverai una notifica via email appena il processo sarà completato.

I tuoi documenti sono protetti e saranno eliminati automaticamente dopo 90 giorni dall'approvazione.

© ${new Date().getFullYear()} Panico App
  `.trim();

  return { subject, html, text };
}

/**
 * Email: Verifica approvata (inviata all'utente)
 */
export function getVerificationApprovedTemplate(data: IdentityApprovedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, approvedAt } = data;

  const subject = '✅ Identità Verificata con Successo!';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Identità Verificata</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 10px;">✅</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Identità Verificata!</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Ciao <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Ottima notizia! La tua identità è stata verificata con successo. Ora hai accesso a tutte le funzionalità dell'app.
              </p>
              
              <div style="background-color: #065f46; border-left: 4px solid #10b981; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0 0 15px; color: #10b981; font-size: 18px; font-weight: 600;">
                  🎉 Cosa puoi fare ora:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #d1fae5;">
                  <li style="margin-bottom: 8px;">Iscriverti alle liste eventi</li>
                  <li style="margin-bottom: 8px;">Acquistare biglietti</li>
                  <li style="margin-bottom: 8px;">Diventare PR e guadagnare</li>
                  <li style="margin-bottom: 8px;">Creare e gestire venue</li>
                </ul>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://eventry.app/dashboard" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Vai alla Dashboard
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #71717a; font-size: 12px; text-align: center;">
                Verificato il ${approvedAt}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #09090b; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} Panico App. Tutti i diritti riservati.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Ciao ${userName},

✅ La tua identità è stata verificata con successo!

Ora hai accesso a:
- Liste eventi
- Acquisto biglietti
- Funzionalità PR
- Gestione venue

Vai alla dashboard: https://eventry.app/dashboard

Verificato il ${approvedAt}

© ${new Date().getFullYear()} Panico App
  `.trim();

  return { subject, html, text };
}

/**
 * Email: Verifica rifiutata (inviata all'utente)
 */
export function getVerificationRejectedTemplate(data: IdentityRejectedEmailData): {
  subject: string;
  html: string;
  text: string;
} {
  const { userName, rejectedAt, rejectionReason } = data;

  const subject = '❌ Richiesta di Verifica Rifiutata';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifica Rifiutata</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #18181b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 10px;">❌</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Richiesta Rifiutata</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #ffffff; font-size: 16px; line-height: 1.6;">
                Ciao <strong>${userName}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Purtroppo la tua richiesta di verifica identità non è stata approvata.
              </p>
              
              <div style="background-color: #7f1d1d; border-left: 4px solid #ef4444; padding: 20px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0 0 10px; color: #fca5a5; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                  Motivo del Rifiuto
                </p>
                <p style="margin: 0; color: #ffffff; font-size: 16px; line-height: 1.6;">
                  ${rejectionReason}
                </p>
              </div>
              
              <div style="background-color: #3f3f46; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; color: #93c5fd; font-size: 14px; line-height: 1.6;">
                  <strong>💡 Suggerimenti:</strong><br>
                  • Assicurati che il documento sia ben leggibile<br>
                  • Verifica che non ci siano riflessi o ombre<br>
                  • Il selfie deve mostrare chiaramente il tuo volto<br>
                  • Usa un documento valido e non scaduto
                </p>
              </div>
              
              <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Puoi inviare una nuova richiesta quando vuoi con documenti aggiornati.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://eventry.app/verifica-identita" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                      Riprova Verifica
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0; color: #71717a; font-size: 12px; text-align: center;">
                Revisionato il ${rejectedAt}
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #09090b; text-align: center;">
              <p style="margin: 0; color: #71717a; font-size: 12px;">
                © ${new Date().getFullYear()} Panico App. Tutti i diritti riservati.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const text = `
Ciao ${userName},

La tua richiesta di verifica identità non è stata approvata.

Motivo: ${rejectionReason}

Suggerimenti:
- Assicurati che il documento sia ben leggibile
- Verifica che non ci siano riflessi o ombre
- Il selfie deve mostrare chiaramente il tuo volto
- Usa un documento valido e non scaduto

Puoi inviare una nuova richiesta: https://eventry.app/verifica-identita

Revisionato il ${rejectedAt}

© ${new Date().getFullYear()} Panico App
  `.trim();

  return { subject, html, text };
}
