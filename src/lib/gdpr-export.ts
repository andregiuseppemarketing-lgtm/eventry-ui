/**
 * GDPR Data Export
 * Esporta tutti i dati personali di un guest (Art. 15 GDPR - Diritto di Accesso)
 */

import { PrismaClient } from '@prisma/client';
import { getAllConsents } from './gdpr-consent';

const prisma = new PrismaClient();

export interface GuestDataExport {
  personalInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    nickname: string | null;
    birthDate: Date | null;
    city: string | null;
    occupation: string | null;
    instagram: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  behavioralData: {
    totalEvents: number;
    lastEventDate: Date | null;
    customerSegment: string;
    preferredDays: string | null;
    averageArrivalTime: string | null;
    prefersTable: boolean;
    averageGroupSize: number;
  };
  eventHistory: Array<{
    eventName: string;
    eventDate: Date;
    venueName: string;
    listName?: string;
    status: string;
  }>;
  tickets: Array<{
    code: string;
    eventName: string;
    type: string;
    price: number | null;
    issuedAt: Date;
    status: string;
    checkins: Array<{
      scannedAt: Date;
      gate: string;
      groupSize: number;
    }>;
  }>;
  feedbacks: Array<{
    eventName: string;
    rating: number;
    comment: string | null;
    submittedAt: Date;
  }>;
  securityNotes: Array<{
    eventName: string;
    severity: string;
    note: string;
    createdAt: Date;
  }>;
  consents: Array<{
    type: string;
    granted: boolean;
    timestamp: Date;
  }>;
  preferences: {
    notifications: any;
    consents: any;
  } | null;
}

/**
 * Esporta tutti i dati di un guest in formato JSON
 */
export async function exportGuestData(guestId: string): Promise<GuestDataExport> {
  // Recupera il guest con tutte le relazioni
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      listEntries: {
        include: {
          list: {
            include: {
              event: {
                include: {
                  venue: true,
                },
              },
            },
          },
        },
      },
      tickets: {
        include: {
          event: true,
          checkins: true,
        },
      },
      feedbacks: {
        include: {
          event: true,
        },
      },
      securityNotes: {
        include: {
          event: true,
        },
      },
      preferences: true,
    } as any,
  }) as any;

  if (!guest) {
    throw new Error('Guest not found');
  }

  // Personal Info
  const personalInfo = {
    id: guest.id,
    firstName: guest.firstName,
    lastName: guest.lastName,
    email: guest.email,
    phone: guest.phone,
    nickname: guest.nickname,
    birthDate: guest.birthDate,
    city: guest.city,
    occupation: guest.occupation,
    instagram: guest.instagram,
    createdAt: guest.createdAt,
    updatedAt: guest.updatedAt,
  };

  // Behavioral Data
  const behavioralData = {
    totalEvents: guest.totalEvents,
    lastEventDate: guest.lastEventDate,
    customerSegment: guest.customerSegment,
    preferredDays: guest.preferredDays,
    averageArrivalTime: guest.averageArrivalTime,
    prefersTable: guest.prefersTable,
    averageGroupSize: guest.averageGroupSize,
  };

  // Event History
  const eventHistory = guest.listEntries.map((entry: any) => ({
    eventName: entry.list.event?.title || 'N/A',
    eventDate: entry.list.event?.dateStart || new Date(),
    venueName: entry.list.event?.venue?.name || 'N/A',
    listName: entry.list.name,
    status: entry.status,
  }));

  // Tickets
  const tickets = guest.tickets.map((ticket: any) => ({
    code: ticket.code,
    eventName: ticket.event.title,
    type: ticket.type,
    price: ticket.price,
    issuedAt: ticket.issuedAt,
    status: ticket.status,
    checkins: ticket.checkins.map((checkin: any) => ({
      scannedAt: checkin.scannedAt,
      gate: checkin.gate,
      groupSize: checkin.groupSize || 1,
    })),
  }));

  // Feedbacks
  const feedbacks = guest.feedbacks.map((feedback: any) => ({
    eventName: feedback.event.title,
    rating: feedback.rating,
    comment: feedback.comment,
    submittedAt: feedback.submittedAt,
  }));

  // Security Notes
  const securityNotes = guest.securityNotes.map((note: any) => ({
    eventName: note.event.title,
    severity: note.severity,
    note: note.note,
    createdAt: note.createdAt,
  }));

  // Consents
  const consents = await getAllConsents(guestId);

  // Preferences
  const preferences = guest.preferences;

  return {
    personalInfo,
    behavioralData,
    eventHistory,
    tickets,
    feedbacks,
    securityNotes,
    consents: consents.map(c => ({
      type: c.type,
      granted: c.granted,
      timestamp: c.grantedAt || c.revokedAt || new Date(),
    })),
    preferences,
  };
}

/**
 * Genera un file JSON scaricabile
 */
export function generateDataExportFile(data: GuestDataExport): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Log dell'export per audit
 */
export async function logDataExport(guestId: string, requestedBy: string): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: requestedBy,
      action: 'DATA_EXPORT_REQUESTED',
      entity: 'Guest',
      entityId: guestId,
      details: {
        timestamp: new Date(),
        gdprArticle: '15',
      },
    },
  });
}
