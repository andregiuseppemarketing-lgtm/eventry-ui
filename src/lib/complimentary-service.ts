import { prisma } from './prisma';
import { ActorType } from '@prisma/client';

/**
 * Production-ready complimentary service using EventQuota unified table
 * Based on migration 20260228181532_add_dynamic_quotas_and_door_states
 */

export type ComplimentaryQuotaType = 'ORGANIZER' | 'PR'; // Legacy compatibility

interface QuotaResult {
  available: boolean;
  remaining: number;
  max: number;
  quotaId?: string;
}

/**
 * Verifica se c'è quota disponibile per emettere un biglietto omaggio
 * @param eventId - ID dell'evento
 * @param actorType - Tipo di attore (PR, ORGANIZATION, VENUE)
 * @param actorId - ID dell'attore (userId per PR, eventId per ORGANIZATION, venueId per VENUE)
 * @returns QuotaResult con disponibilità e quotaId per consumo successivo
 */
export async function checkComplimentaryQuota(
  eventId: string,
  actorType: ActorType,
  actorId: string
): Promise<QuotaResult> {
  const quota = await prisma.eventQuota.findUnique({
    where: {
      eventId_actorType_actorId: {
        eventId,
        actorType,
        actorId,
      },
    },
  });

  if (!quota) {
    return {
      available: false,
      remaining: 0,
      max: 0,
    };
  }

  return {
    available: quota.available > 0,
    remaining: quota.available,
    max: quota.total,
    quotaId: quota.id,
  };
}

/**
 * Consuma una quota di biglietto omaggio in transazione atomica
 * - Verifica available > 0
 * - Incrementa used
 * - Decrementa available
 * - Crea ComplimentaryAssignmentLog
 * 
 * @param eventId - ID dell'evento
 * @param ticketId - ID del ticket creato
 * @param actorType - Tipo di attore (PR, ORGANIZATION, VENUE)
 * @param actorId - ID dell'attore (userId per PR, eventId per ORGANIZATION, venueId per VENUE)
 * @param assignedByUserId - ID dell'utente che ha assegnato il biglietto (sempre userId)
 * @param assignedToId - ID dell'utente/guest a cui è assegnato (opzionale)
 * @param reason - Motivo dell'assegnazione (opzionale)
 * @param guestName - Nome del guest se non registrato (opzionale)
 * @throws Error se quota non disponibile o operazione fallisce
 */
export async function consumeComplimentaryPass(
  eventId: string,
  ticketId: string,
  actorType: ActorType,
  actorId: string,
  assignedByUserId: string,
  assignedToId?: string,
  reason?: string,
  guestName?: string
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. Lock e verifica quota
    const quota = await tx.eventQuota.findUnique({
      where: {
        eventId_actorType_actorId: {
          eventId,
          actorType,
          actorId,
        },
      },
    });

    if (!quota) {
      throw new Error('Quota non trovata per questo evento e utente');
    }

    if (quota.available <= 0) {
      throw new Error(
        `Quota biglietti omaggio esaurita (${quota.used}/${quota.total} utilizzati)`
      );
    }

    // 2. Aggiorna quota atomicamente
    await tx.eventQuota.update({
      where: { id: quota.id },
      data: {
        used: { increment: 1 },
        available: { decrement: 1 },
      },
    });

    // 3. Crea log assegnazione
    await tx.complimentaryAssignmentLog.create({
      data: {
        quotaId: quota.id,
        ticketId,
        assignedBy: assignedByUserId,
        assignedTo: assignedToId || 'guest',
        guestName: guestName || null,
      },
    });

    // 4. Aggiorna ticket con quotaId
    await tx.ticket.update({
      where: { id: ticketId },
      data: {
        complimentaryQuotaId: quota.id,
      },
    });
  });
}

/**
 * Ottiene tutte le quote di biglietti omaggio per un evento
 * Restituisce: organizer quota + tutte le quote PR con nomi utenti
 */
export async function getEventComplimentaryQuotas(eventId: string) {
  const quotas = await prisma.eventQuota.findMany({
    where: { eventId },
    orderBy: [
      { actorType: 'asc' },
      { actorId: 'asc' },
    ],
  });

  // Ottieni info utenti per PR
  const prActorIds = quotas
    .filter((q) => q.actorType === 'PR')
    .map((q) => q.actorId);

  const prUsers = await prisma.user.findMany({
    where: { id: { in: prActorIds } },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  const prUserMap = new Map(prUsers.map((u) => [u.id, u]));

  // Separa organizer e PR
  const organizerQuota = quotas.find((q) => q.actorType === 'ORGANIZATION');
  const prQuotas = quotas.filter((q) => q.actorType === 'PR');

  const totalUsed = quotas.reduce((sum, q) => sum + q.used, 0);
  const totalAvailable = quotas.reduce((sum, q) => sum + q.available, 0);

  return {
    organizer: {
      max: organizerQuota?.total || 0,
      used: organizerQuota?.used || 0,
      available: organizerQuota?.available || 0,
    },
    pr: prQuotas.map((q) => {
      const user = prUserMap.get(q.actorId);
      return {
        prUserId: q.actorId,
        prName: user?.name || user?.email || q.actorId,
        max: q.total,
        used: q.used,
        available: q.available,
      };
    }),
    totalUsed,
    totalAvailable,
  };
}

/**
 * Ottiene la quota disponibile per un singolo PR su un evento
 */
export async function getPRComplimentaryQuota(eventId: string, prUserId: string) {
  const quota = await prisma.eventQuota.findUnique({
    where: {
      eventId_actorType_actorId: {
        eventId,
        actorType: 'PR',
        actorId: prUserId,
      },
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
  });

  if (!quota) {
    return {
      eventId,
      prUserId,
      max: 0,
      used: 0,
      available: 0,
      event: null,
    };
  }

  return {
    eventId: quota.eventId,
    prUserId: quota.actorId,
    max: quota.total,
    used: quota.used,
    available: quota.available,
    event: quota.event,
  };
}

/**
 * Aggiorna le quote per un evento
 * VINCOLO: total NON può scendere sotto used
 * Crea QuotaAuditLog per ogni modifica
 * 
 * @throws Error se total < used per qualsiasi quota
 */
export async function updateEventComplimentaryQuotas(
  eventId: string,
  organizerQuota: number,
  prQuotas: Array<{ prUserId: string; maxFreePasses: number }>,
  changedBy?: string
) {
  await prisma.$transaction(async (tx) => {
    // 1. Aggiorna/crea quota organizer
    const existingOrgQuota = await tx.eventQuota.findUnique({
      where: {
        eventId_actorType_actorId: {
          eventId,
          actorType: 'ORGANIZATION',
          actorId: eventId, // Per ORGANIZATION, actorId = eventId (convention)
        },
      },
    });

    // Validazione: total >= used
    if (existingOrgQuota && organizerQuota < existingOrgQuota.used) {
      throw new Error(
        `Impossibile impostare quota organizer a ${organizerQuota}: sono già stati utilizzati ${existingOrgQuota.used} biglietti. ` +
        `La quota totale non può essere inferiore ai biglietti già assegnati.`
      );
    }

    const newOrgAvailable = organizerQuota - (existingOrgQuota?.used || 0);

    if (existingOrgQuota) {
      // Update
      await tx.eventQuota.update({
        where: { id: existingOrgQuota.id },
        data: {
          total: organizerQuota,
          available: newOrgAvailable,
        },
      });

      // Audit log
      if (existingOrgQuota.total !== organizerQuota) {
        await tx.quotaAuditLog.create({
          data: {
            quotaId: existingOrgQuota.id,
            changedBy: changedBy || 'system',
            oldValue: existingOrgQuota.total,
            newValue: organizerQuota,
            delta: organizerQuota - existingOrgQuota.total,
            reason: 'Aggiornamento quota organizer da settings',
          },
        });
      }
    } else {
      // Create
      const newQuota = await tx.eventQuota.create({
        data: {
          eventId,
          actorType: 'ORGANIZATION',
          actorId: eventId,
          total: organizerQuota,
          used: 0,
          available: organizerQuota,
        },
      });

      // Audit log
      await tx.quotaAuditLog.create({
        data: {
          quotaId: newQuota.id,
          changedBy: changedBy || 'system',
          oldValue: 0,
          newValue: organizerQuota,
          delta: organizerQuota,
          reason: 'Creazione quota organizer',
        },
      });
    }

    // 2. Aggiorna/crea quote PR
    for (const prQuota of prQuotas) {
      const existingPRQuota = await tx.eventQuota.findUnique({
        where: {
          eventId_actorType_actorId: {
            eventId,
            actorType: 'PR',
            actorId: prQuota.prUserId,
          },
        },
      });

      // Validazione: total >= used
      if (existingPRQuota && prQuota.maxFreePasses < existingPRQuota.used) {
        const prUser = await tx.user.findUnique({
          where: { id: prQuota.prUserId },
          select: { name: true, email: true },
        });
        const prName = prUser?.name || prUser?.email || prQuota.prUserId;

        throw new Error(
          `Impossibile impostare quota per ${prName} a ${prQuota.maxFreePasses}: ` +
          `sono già stati utilizzati ${existingPRQuota.used} biglietti. ` +
          `La quota totale non può essere inferiore ai biglietti già assegnati.`
        );
      }

      const newPRAvailable = prQuota.maxFreePasses - (existingPRQuota?.used || 0);

      if (existingPRQuota) {
        // Update
        await tx.eventQuota.update({
          where: { id: existingPRQuota.id },
          data: {
            total: prQuota.maxFreePasses,
            available: newPRAvailable,
          },
        });

        // Audit log
        if (existingPRQuota.total !== prQuota.maxFreePasses) {
          await tx.quotaAuditLog.create({
            data: {
              quotaId: existingPRQuota.id,
              changedBy: changedBy || 'system',
              oldValue: existingPRQuota.total,
              newValue: prQuota.maxFreePasses,
              delta: prQuota.maxFreePasses - existingPRQuota.total,
              reason: 'Aggiornamento quota PR da settings',
            },
          });
        }
      } else {
        // Create
        const newQuota = await tx.eventQuota.create({
          data: {
            eventId,
            actorType: 'PR',
            actorId: prQuota.prUserId,
            total: prQuota.maxFreePasses,
            used: 0,
            available: prQuota.maxFreePasses,
          },
        });

        // Audit log
        await tx.quotaAuditLog.create({
          data: {
            quotaId: newQuota.id,
            changedBy: changedBy || 'system',
            oldValue: 0,
            newValue: prQuota.maxFreePasses,
            delta: prQuota.maxFreePasses,
            reason: 'Creazione quota PR',
          },
        });
      }
    }
  });
}
