import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/lib/api';
import { getVerificationApprovedTemplate, getVerificationRejectedTemplate } from '@/lib/identity-verification-emails';
import { Resend } from 'resend';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    const { verificationId, approved, rejectionReason } = await req.json();

    if (!verificationId || typeof approved !== 'boolean') {
      return NextResponse.json(
        { error: 'Parametri mancanti o non validi' },
        { status: 400 }
      );
    }

    if (!approved && !rejectionReason) {
      return NextResponse.json(
        { error: 'Motivo del rifiuto richiesto' },
        { status: 400 }
      );
    }

    // Get verification
    const verification = await prisma.identityVerification.findUnique({
      where: { id: verificationId },
      include: { user: true },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Verifica non trovata' }, { status: 404 });
    }

    if (verification.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Questa verifica è già stata revisionata' },
        { status: 400 }
      );
    }

    // Update verification
    const updatedVerification = await prisma.identityVerification.update({
      where: { id: verificationId },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        rejectionReason: approved ? null : rejectionReason,
      },
    });

    // Update user if approved
    if (approved) {
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          identityVerified: true,
          identityVerifiedAt: new Date(),
        },
      });
    }

    // Audit log
    await createAuditLog(
      session.user.id,
      approved ? 'IDENTITY_VERIFICATION_APPROVED' : 'IDENTITY_VERIFICATION_REJECTED',
      'IdentityVerification',
      verificationId,
      {
        userId: verification.userId,
        approved,
        rejectionReason,
      }
    );

    // Send email notification to user
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const userName = verification.user.name || verification.user.email.split('@')[0];
        
        let emailTemplate;
        if (approved) {
          emailTemplate = getVerificationApprovedTemplate({
            userName,
            approvedAt: new Date().toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        } else {
          emailTemplate = getVerificationRejectedTemplate({
            userName,
            rejectedAt: new Date().toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            rejectionReason: rejectionReason || 'Documenti non validi o illeggibili'
          });
        }

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@panico.app',
          to: verification.user.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Non bloccare la richiesta se l'email fallisce
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedVerification.id,
        status: updatedVerification.status,
      },
    });
  } catch (error: any) {
    console.error('Identity review error:', error);
    return NextResponse.json(
      { error: 'Errore durante la revisione' },
      { status: 500 }
    );
  }
}
