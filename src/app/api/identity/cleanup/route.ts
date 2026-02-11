import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { cleanupExpiredDocuments } from '@/scripts/cleanup-expired-documents';

/**
 * POST /api/identity/cleanup
 * Esegue cleanup manuale dei documenti scaduti
 * Solo ADMIN
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorizzato' }, { status: 403 });
    }

    console.log(`🧹 Cleanup manuale avviato da: ${session.user.email}`);

    const stats = await cleanupExpiredDocuments();

    return NextResponse.json({
      success: true,
      message: 'Cleanup completato',
      stats: {
        warned: stats.warned,
        deleted: stats.deleted,
        errors: stats.errors,
      },
    });
  } catch (error: any) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { 
        error: 'Errore durante il cleanup', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
