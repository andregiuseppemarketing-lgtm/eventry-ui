import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { createAuditLog } from '@/lib/api';
import { getVerificationSubmittedTemplate } from '@/lib/identity-verification-emails';
import { checkIdentityUploadLimit } from '@/lib/rate-limiter';
import { Resend } from 'resend';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'identity');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

async function saveFile(file: File, prefix: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const extension = file.name.split('.').pop();
  const filename = `${prefix}_${timestamp}_${randomString}.${extension}`;
  const filepath = join(UPLOAD_DIR, filename);
  
  await writeFile(filepath, buffer);
  
  return `/uploads/identity/${filename}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Rate limiting check
    const rateLimitResult = checkIdentityUploadLimit(session.user.id);
    
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { 
          error: rateLimitResult.message,
          hourlyRemaining: rateLimitResult.hourlyRemaining,
          dailyRemaining: rateLimitResult.dailyRemaining,
          resetAt: rateLimitResult.resetAt,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit-Hourly': '3',
            'X-RateLimit-Limit-Daily': '10',
            'X-RateLimit-Remaining-Hourly': rateLimitResult.hourlyRemaining.toString(),
            'X-RateLimit-Remaining-Daily': rateLimitResult.dailyRemaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetAt).toISOString(),
            'Retry-After': Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    // Check if user already has a pending verification
    const existingVerification = await prisma.identityVerification.findFirst({
      where: {
        userId: session.user.id,
        status: 'PENDING',
      },
    });

    if (existingVerification) {
      return NextResponse.json(
        { error: 'Hai già una richiesta di verifica in corso' },
        { status: 400 }
      );
    }

    // Parse form data
    const formData = await req.formData();
    const documentType = formData.get('documentType') as string;
    const documentNumber = formData.get('documentNumber') as string | null;
    const documentFrontFile = formData.get('documentFront') as File;
    const documentBackFile = formData.get('documentBack') as File | null;
    const selfieFile = formData.get('selfie') as File;

    // Validate
    if (!documentType || !documentFrontFile || !selfieFile) {
      return NextResponse.json(
        { error: 'Documenti mancanti' },
        { status: 400 }
      );
    }

    if (documentType === 'ID_CARD' && !documentBackFile) {
      return NextResponse.json(
        { error: 'Retro della carta d\'identità richiesto' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Save files
    const documentFrontUrl = await saveFile(documentFrontFile, 'doc_front');
    const documentBackUrl = documentBackFile
      ? await saveFile(documentBackFile, 'doc_back')
      : null;
    const selfieUrl = await saveFile(selfieFile, 'selfie');

    // Create verification record
    const verification = await prisma.identityVerification.create({
      data: {
        userId: session.user.id,
        documentType: documentType as any,
        documentNumber: documentNumber || undefined,
        documentFrontUrl,
        documentBackUrl,
        selfieUrl,
        status: 'PENDING',
      },
    });

    // Audit log
    await createAuditLog(
      session.user.id,
      'IDENTITY_VERIFICATION_SUBMITTED',
      'IdentityVerification',
      verification.id,
      { documentType }
    );

    // Send email notification to user
    try {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { email: true, name: true }
      });

      if (user && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const userName = user.name || user.email.split('@')[0];

        const documentTypeLabels = {
          ID_CARD: 'Carta d\'Identità',
          PASSPORT: 'Passaporto',
          DRIVER_LICENSE: 'Patente di Guida'
        };

        const emailTemplate = getVerificationSubmittedTemplate({
          userName,
          userEmail: user.email,
          documentType: documentTypeLabels[documentType as keyof typeof documentTypeLabels] || documentType,
          submittedAt: new Date().toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          verificationId: verification.id
        });

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@panico.app',
          to: user.email,
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
        id: verification.id,
        status: verification.status,
      },
    });
  } catch (error: any) {
    console.error('Identity upload error:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'upload dei documenti' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    // Get user's verification requests
    const verifications = await prisma.identityVerification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        documentType: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        rejectionReason: true,
      },
    });

    return NextResponse.json({ success: true, data: verifications });
  } catch (error: any) {
    console.error('Get verification error:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero delle verifiche' },
      { status: 500 }
    );
  }
}
