/**
 * Cleanup Expired Identity Documents
 * Elimina documenti di identità dopo 90 giorni dall'approvazione (GDPR compliance)
 * 
 * Esegui con: node scripts/cleanup-expired-documents.ts
 * O in cron job: 0 2 * * * (ogni giorno alle 2 AM)
 */

import { PrismaClient } from '@prisma/client';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'identity');
const RETENTION_DAYS = 90; // GDPR compliance
const WARNING_DAYS = 7; // Notifica 7 giorni prima

interface CleanupStats {
  warned: number;
  deleted: number;
  errors: number;
}

/**
 * Elimina file dal filesystem
 */
async function deleteFile(filepath: string): Promise<boolean> {
  try {
    await unlink(filepath);
    console.log(`✅ File eliminato: ${filepath}`);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.warn(`⚠️  File già eliminato: ${filepath}`);
      return true; // Consider as success if file doesn't exist
    }
    console.error(`❌ Errore eliminazione file: ${filepath}`, error);
    return false;
  }
}

/**
 * Estrae filename da URL
 */
function extractFilename(url: string): string | null {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1] || null;
}

/**
 * Invia email di pre-warning (7 giorni prima)
 */
async function sendWarningEmail(user: { email: string; name: string | null }, daysLeft: number) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.warn('⚠️  Resend API key non configurata, skip email warning');
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `⚠️ I tuoi documenti saranno eliminati tra ${daysLeft} giorni`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Eliminazione Documenti Programmata</title>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #18181b; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 10px;">⚠️</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Documenti in Scadenza</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #ffffff; font-size: 16px;">
                Ciao <strong>${user.name || user.email.split('@')[0]}</strong>,
              </p>
              
              <p style="margin: 0 0 20px; color: #a1a1aa; font-size: 16px; line-height: 1.6;">
                Ti informiamo che i documenti di identità che ci hai fornito saranno <strong>eliminati automaticamente tra ${daysLeft} giorni</strong>, in conformità con la normativa GDPR sulla privacy.
              </p>
              
              <div style="background-color: #3f3f46; border-left: 4px solid #eab308; padding: 16px; border-radius: 6px; margin: 30px 0;">
                <p style="margin: 0; color: #fbbf24; font-size: 14px; line-height: 1.6;">
                  <strong>Perché eliminiamo i documenti?</strong><br>
                  Per garantire la massima sicurezza dei tuoi dati personali, conserviamo i documenti solo per 90 giorni dall'approvazione della verifica. Dopo questo periodo, tutti i file vengono eliminati definitivamente dai nostri server.
                </p>
              </div>
              
              <p style="margin: 30px 0 0; color: #a1a1aa; font-size: 14px; line-height: 1.6;">
                <strong>Cosa significa per te?</strong><br>
                Il tuo account rimarrà verificato e potrai continuare ad utilizzare tutte le funzionalità dell'app normalmente. Solo i file dei documenti verranno eliminati.
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
      `,
      text: `
Ciao ${user.name || user.email.split('@')[0]},

I tuoi documenti di identità saranno eliminati automaticamente tra ${daysLeft} giorni, in conformità con il GDPR.

Il tuo account rimarrà verificato e potrai continuare ad utilizzare l'app normalmente.

© ${new Date().getFullYear()} Panico App
      `.trim(),
    });

    console.log(`📧 Email warning inviata a: ${user.email}`);
  } catch (error) {
    console.error(`❌ Errore invio email a ${user.email}:`, error);
  }
}

/**
 * Processo principale di cleanup
 */
async function cleanupExpiredDocuments(): Promise<CleanupStats> {
  const stats: CleanupStats = {
    warned: 0,
    deleted: 0,
    errors: 0,
  };

  const now = new Date();
  const expirationDate = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const warningDate = new Date(now.getTime() - (RETENTION_DAYS - WARNING_DAYS) * 24 * 60 * 60 * 1000);

  console.log(`🗓️  Retention period: ${RETENTION_DAYS} giorni`);
  console.log(`📅 Expiration date: ${expirationDate.toISOString()}`);
  console.log(`⚠️  Warning date: ${warningDate.toISOString()}\n`);

  try {
    // 1. Find verifications to warn (83 giorni dopo approval)
    const toWarn = await prisma.identityVerification.findMany({
      where: {
        status: 'APPROVED',
        reviewedAt: {
          lt: warningDate,
          gte: expirationDate, // Not yet expired
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`⚠️  Trovate ${toWarn.length} verifiche da avvisare\n`);

    for (const verification of toWarn) {
      const daysUntilDeletion = Math.ceil(
        (RETENTION_DAYS * 24 * 60 * 60 * 1000 - (now.getTime() - new Date(verification.reviewedAt!).getTime())) /
          (24 * 60 * 60 * 1000)
      );

      await sendWarningEmail(verification.user, daysUntilDeletion);
      stats.warned++;
    }

    // 2. Find verifications to delete (> 90 giorni)
    const toDelete = await prisma.identityVerification.findMany({
      where: {
        status: 'APPROVED',
        reviewedAt: {
          lt: expirationDate,
        },
      },
      select: {
        id: true,
        documentFrontUrl: true,
        documentBackUrl: true,
        selfieUrl: true,
        userId: true,
      },
    });

    console.log(`\n🗑️  Trovate ${toDelete.length} verifiche da eliminare\n`);

    for (const verification of toDelete) {
      let success = true;

      // Delete document files
      const files = [
        verification.documentFrontUrl,
        verification.documentBackUrl,
        verification.selfieUrl,
      ].filter(Boolean) as string[];

      for (const fileUrl of files) {
        const filename = extractFilename(fileUrl);
        if (filename) {
          const filepath = join(UPLOAD_DIR, filename);
          const deleted = await deleteFile(filepath);
          if (!deleted) {
            success = false;
            stats.errors++;
          }
        }
      }

      // Update verification status to EXPIRED
      if (success) {
        try {
          await prisma.identityVerification.update({
            where: { id: verification.id },
            data: {
              status: 'EXPIRED',
              updatedAt: new Date(),
            },
          });

          console.log(`✅ Verification ${verification.id} marcata come EXPIRED`);
          stats.deleted++;
        } catch (error) {
          console.error(`❌ Errore update status verification ${verification.id}:`, error);
          stats.errors++;
        }
      }
    }

    return stats;
  } catch (error) {
    console.error('❌ Errore durante cleanup:', error);
    throw error;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Avvio cleanup documenti scaduti...\n');

  try {
    const stats = await cleanupExpiredDocuments();

    console.log('\n📊 Risultati:');
    console.log(`   ⚠️  Utenti avvisati: ${stats.warned}`);
    console.log(`   🗑️  Documenti eliminati: ${stats.deleted}`);
    console.log(`   ❌ Errori: ${stats.errors}`);
    console.log('\n✅ Cleanup completato!');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Cleanup fallito:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { cleanupExpiredDocuments };
export type { CleanupStats };
