import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { requestDataDeletion } from '@/lib/gdpr-deletion';

/**
 * API per richiesta cancellazione dati (GDPR Art. 17)
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { guestId, reason } = body;

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID richiesto' },
        { status: 400 }
      );
    }

    // Verifica permessi
    if (session.user.role !== 'ADMIN') {
      // TODO: Verifica che guestId appartenga a session.user
    }

    // Registra richiesta di cancellazione
    await requestDataDeletion(guestId, reason);

    return NextResponse.json({
      success: true,
      message: 'Richiesta di cancellazione dati registrata. Sarà processata entro 30 giorni.',
    });

  } catch (error) {
    console.error('[GDPR Delete] Errore:', error);
    return NextResponse.json(
      {
        error: 'Errore durante la richiesta di cancellazione',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
