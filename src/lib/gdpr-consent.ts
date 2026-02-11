/**
 * GDPR Consent Management
 * Gestisce il consenso degli utenti per trattamento dati personali
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type ConsentType = 
  | 'MARKETING_EMAIL'
  | 'MARKETING_SMS'
  | 'PROFILING'
  | 'THIRD_PARTY_SHARING'
  | 'ANALYTICS';

export interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Salva o aggiorna il consenso di un guest
 */
export async function updateConsent(
  guestId: string,
  consentType: ConsentType,
  granted: boolean,
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  const now = new Date();

  // Verifica se esiste già un record di consenso
  const existingConsent = await prisma.customerPreferences.findUnique({
    where: { guestId },
  }) as any;

  const consentData = {
    type: consentType,
    granted,
    timestamp: now,
    ipAddress: metadata?.ipAddress,
    userAgent: metadata?.userAgent,
  };

  if (existingConsent) {
    // Aggiorna consensi esistenti
    const consents = (existingConsent.consents as any[]) || [];
    const updatedConsents = [
      ...consents.filter((c: any) => c.type !== consentType),
      consentData,
    ];

    await prisma.customerPreferences.update({
      where: { guestId },
      data: {
        consents: updatedConsents,
        updatedAt: now,
      } as any,
    });
  } else {
    // Crea nuovo record
    await prisma.customerPreferences.create({
      data: {
        guestId,
        consents: [consentData],
      } as any,
    });
  }

  // Log audit
  await prisma.auditLog.create({
    data: {
      userId: guestId,
      action: granted ? 'CONSENT_GRANTED' : 'CONSENT_REVOKED',
      entity: 'CustomerPreferences',
      entityId: guestId,
      details: {
        consentType,
        ...metadata,
      },
    },
  });
}

/**
 * Verifica se un guest ha dato un consenso specifico
 */
export async function hasConsent(
  guestId: string,
  consentType: ConsentType
): Promise<boolean> {
  const preferences = await prisma.customerPreferences.findUnique({
    where: { guestId },
  }) as any;

  if (!preferences || !preferences.consents) {
    return false;
  }

  const consents = preferences.consents as any[];
  const consent = consents.find((c: any) => c.type === consentType);

  return consent?.granted || false;
}

/**
 * Ottiene tutti i consensi di un guest
 */
export async function getAllConsents(guestId: string): Promise<ConsentRecord[]> {
  const preferences = await prisma.customerPreferences.findUnique({
    where: { guestId },
  }) as any;

  if (!preferences || !preferences.consents) {
    return [];
  }

  return preferences.consents as ConsentRecord[];
}

/**
 * Revoca tutti i consensi marketing (opt-out totale)
 */
export async function revokeAllMarketingConsents(guestId: string): Promise<void> {
  const marketingTypes: ConsentType[] = [
    'MARKETING_EMAIL',
    'MARKETING_SMS',
    'PROFILING',
  ];

  for (const type of marketingTypes) {
    await updateConsent(guestId, type, false);
  }
}

/**
 * Verifica se può inviare email marketing
 */
export async function canSendMarketingEmail(guestId: string): Promise<boolean> {
  return hasConsent(guestId, 'MARKETING_EMAIL');
}

/**
 * Verifica se può inviare SMS marketing
 */
export async function canSendMarketingSMS(guestId: string): Promise<boolean> {
  return hasConsent(guestId, 'MARKETING_SMS');
}
