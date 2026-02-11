import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'identity');

/**
 * GET /api/identity/document/[filename]
 * Serve documenti di identità in modo protetto
 * Accesso consentito a: owner, ADMIN, SECURITY
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 });
    }

    const { filename } = await params;

    // Sanitize filename (prevent directory traversal)
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return NextResponse.json({ error: 'Filename non valido' }, { status: 400 });
    }

    // Find verification that owns this document
    const verification = await prisma.identityVerification.findFirst({
      where: {
        OR: [
          { documentFrontUrl: { contains: filename } },
          { documentBackUrl: { contains: filename } },
          { selfieUrl: { contains: filename } },
        ],
      },
      select: {
        userId: true,
        status: true,
      },
    });

    if (!verification) {
      return NextResponse.json({ error: 'Documento non trovato' }, { status: 404 });
    }

    // Check permissions
    const isOwner = verification.userId === session.user.id;
    const isAdmin = session.user.role === 'ADMIN';
    const isSecurity = session.user.role === 'SECURITY';

    if (!isOwner && !isAdmin && !isSecurity) {
      return NextResponse.json(
        { error: 'Non autorizzato ad accedere a questo documento' },
        { status: 403 }
      );
    }

    // Read file
    const filepath = join(UPLOAD_DIR, filename);
    const fileBuffer = await readFile(filepath);

    // Determine content type
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
    };
    const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';

    // Return file with security headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600', // 1 hour cache
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      },
    });
  } catch (error: any) {
    console.error('Document access error:', error);
    
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File non trovato' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Errore durante l\'accesso al documento' },
      { status: 500 }
    );
  }
}
