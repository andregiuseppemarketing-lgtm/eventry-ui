import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/api';
import { getVerificationApprovedTemplate } from '@/lib/identity-verification-emails';
import { Resend } from 'resend';

const MAX_BATCH_SIZE = 10;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * POST /api/identity/batch-approve
 * Approva multiple verifiche in batch
 * Solo ADMIN
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { verificationIds } = await req.json();

    // Validate
    if (!Array.isArray(verificationIds) || verificationIds.length === 0) {
      return NextResponse.json(
        { error: 'Lista verificationIds richiesta' },
        { status: 400 }
      );
    }

    if (verificationIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Massimo ${MAX_BATCH_SIZE} verifiche per batch` },
        { status: 400 }
      );
    }

    // Get all verifications
    const verifications = await prisma.identityVerification.findMany({
      where: {
        id: { in: verificationIds },
        status: 'PENDING', // Only approve pending ones
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            identityVerified: true,
          },
        },
      },
    });

    if (verifications.length === 0) {
      return NextResponse.json(
        { error: 'Nessuna verifica pending trovata' },
        { status: 404 }
      );
    }

    const results = {
      approved: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each verification
    for (const verification of verifications) {
      try {
        // Update verification
        await prisma.identityVerification.update({
          where: { id: verification.id },
          data: {
            status: 'APPROVED',
            reviewedBy: session.user.id,
            reviewedAt: new Date(),
          },
        });

        // Update user if not already verified
        if (!verification.user.identityVerified) {
          await prisma.user.update({
            where: { id: verification.user.id },
            data: {
              identityVerified: true,
              identityVerifiedAt: new Date(),
            },
          });
        }

        // Audit log
        await createAuditLog(
          session.user.id,
          'IDENTITY_VERIFICATION_APPROVED',
          'IdentityVerification',
          verification.id,
          {
            userId: verification.user.id,
            batchOperation: true,
          }
        );

        // Send email
        if (resend && process.env.EMAIL_FROM) {
          try {
            const emailTemplate = getVerificationApprovedTemplate({
              userName: verification.user.name || verification.user.email.split('@')[0],
              approvedAt: new Date().toLocaleDateString('it-IT', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
            });

            await resend.emails.send({
              from: process.env.EMAIL_FROM,
              to: verification.user.email,
              subject: emailTemplate.subject,
              html: emailTemplate.html,
              text: emailTemplate.text,
            });
          } catch (emailError) {
            console.error('Email error (non-blocking):', emailError);
          }
        }

        results.approved++;
      } catch (error: any) {
        console.error(`Error approving verification ${verification.id}:`, error);
        results.failed++;
        results.errors.push(`${verification.user.email}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.approved} verifiche approvate`,
      results: {
        approved: results.approved,
        failed: results.failed,
        total: verifications.length,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error('Batch approve error:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'approvazione batch' },
      { status: 500 }
    );
  }
}
