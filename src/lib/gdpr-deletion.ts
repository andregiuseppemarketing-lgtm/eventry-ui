/**
 * GDPR Data Deletion
 * Gestisce il diritto all'oblio (Art. 17 GDPR - Right to be Forgotten)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DeletionResult {
  success: boolean;
  deletedRecords: {
    guest: boolean;
    listEntries: number;
    tickets: number;
    checkins: number;
    feedbacks: number;
    securityNotes: number;
    preferences: boolean;
    consumptions: number;
  };
  errors?: string[];
}

/**
 * Anonimizza i dati di un guest (soft delete)
 * Mantiene i dati statistici ma rimuove informazioni personali
 */
export async function anonymizeGuestData(guestId: string): Promise<DeletionResult> {
  const errors: string[] = [];
  const deletedRecords = {
    guest: false,
    listEntries: 0,
    tickets: 0,
    checkins: 0,
    feedbacks: 0,
    securityNotes: 0,
    preferences: false,
    consumptions: 0,
  };

  try {
    // 1. Anonimizza dati personali del guest
    await prisma.guest.update({
      where: { id: guestId },
      data: {
        firstName: 'DELETED',
        lastName: 'USER',
        email: null,
        phone: null,
        nickname: null,
        birthDate: null,
        city: null,
        occupation: null,
        instagram: null,
        // Mantieni dati comportamentali per statistiche
      },
    });
    deletedRecords.guest = true;

    // 2. Elimina preferenze e consensi
    const deletedPreferences = await prisma.customerPreferences.deleteMany({
      where: { guestId },
    });
    deletedRecords.preferences = deletedPreferences.count > 0;

    // 3. Anonimizza feedback (mantieni rating per statistiche)
    const feedbacks = await prisma.eventFeedback.updateMany({
      where: { guestId },
      data: {
        comment: '[DELETED]',
      },
    });
    deletedRecords.feedbacks = feedbacks.count;

    // 4. Elimina note di sicurezza
    const securityNotes = await prisma.securityNote.deleteMany({
      where: { guestId },
    });
    deletedRecords.securityNotes = securityNotes.count;

    // 5. Elimina consumi
    const consumptions = await prisma.consumption.deleteMany({
      where: {
        ticket: {
          guestId,
        } as any,
      },
    });
    deletedRecords.consumptions = consumptions.count;

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: 'system',
        action: 'GDPR_DATA_ANONYMIZED',
        entity: 'Guest',
        entityId: guestId,
        details: {
          timestamp: new Date(),
          gdprArticle: '17',
          deletedRecords,
        },
      },
    });

    return {
      success: true,
      deletedRecords,
    };

  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return {
      success: false,
      deletedRecords,
      errors,
    };
  }
}

/**
 * Elimina completamente un guest (hard delete)
 * ATTENZIONE: Questa operazione è irreversibile e può violare vincoli di integrità
 */
export async function permanentlyDeleteGuest(guestId: string): Promise<DeletionResult> {
  const errors: string[] = [];
  const deletedRecords = {
    guest: false,
    listEntries: 0,
    tickets: 0,
    checkins: 0,
    feedbacks: 0,
    securityNotes: 0,
    preferences: false,
    consumptions: 0,
  };

  try {
    // Usa una transaction per garantire atomicità
    await prisma.$transaction(async (tx) => {
      // 1. Elimina consumi
      const consumptions = await tx.consumption.deleteMany({
        where: {
          ticket: {
            guestId,
          } as any,
        },
      });
      deletedRecords.consumptions = consumptions.count;

      // 2. Elimina check-ins
      const checkins = await tx.checkIn.deleteMany({
        where: {
          ticket: {
            guestId,
          } as any,
        },
      });
      deletedRecords.checkins = checkins.count;

      // 3. Elimina tickets
      const tickets = await tx.ticket.deleteMany({
        where: { guestId } as any,
      });
      deletedRecords.tickets = tickets.count;

      // 4. Elimina feedbacks
      const feedbacks = await tx.eventFeedback.deleteMany({
        where: { guestId },
      });
      deletedRecords.feedbacks = feedbacks.count;

      // 5. Elimina security notes
      const securityNotes = await tx.securityNote.deleteMany({
        where: { guestId },
      });
      deletedRecords.securityNotes = securityNotes.count;

      // 6. Elimina list entries
      const listEntries = await tx.listEntry.deleteMany({
        where: { guestId },
      });
      deletedRecords.listEntries = listEntries.count;

      // 7. Elimina preferenze
      const preferences = await tx.customerPreferences.deleteMany({
        where: { guestId },
      });
      deletedRecords.preferences = preferences.count > 0;

      // 8. Elimina il guest
      await tx.guest.delete({
        where: { id: guestId },
      });
      deletedRecords.guest = true;

      // Log audit (ultimo step prima del commit)
      await tx.auditLog.create({
        data: {
          userId: 'system',
          action: 'GDPR_DATA_DELETED',
          entity: 'Guest',
          entityId: guestId,
          details: {
            timestamp: new Date(),
            gdprArticle: '17',
            deletedRecords,
            permanent: true,
          },
        },
      });
    });

    return {
      success: true,
      deletedRecords,
    };

  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return {
      success: false,
      deletedRecords,
      errors,
    };
  }
}

/**
 * Richiesta di cancellazione dati (da processare manualmente)
 */
export async function requestDataDeletion(
  guestId: string,
  reason?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: guestId,
      action: 'DATA_DELETION_REQUESTED',
      entity: 'Guest',
      entityId: guestId,
      details: {
        timestamp: new Date(),
        gdprArticle: '17',
        reason,
        status: 'PENDING',
      },
    },
  });

  // TODO: Invia notifica agli admin
  // await notifyAdmins('data_deletion_request', { guestId, reason });
}
