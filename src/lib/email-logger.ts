/**
 * MILESTONE 7 - Email Logging Helper
 * Funzioni per registrare log delle email inviate
 */

import { prisma } from '@/lib/prisma';

type EmailLogData = {
  recipient: string;
  subject: string;
  type: string;
  status: 'sent' | 'failed';
  error?: string;
  resendId?: string;
};

export async function logEmail(data: EmailLogData) {
  try {
    await prisma.emailLog.create({
      data: {
        recipient: data.recipient,
        subject: data.subject,
        type: data.type,
        status: data.status,
        error: data.error || null,
        resendId: data.resendId || null,
      },
    });
  } catch (error) {
    console.error('Failed to log email:', error);
  }
}
