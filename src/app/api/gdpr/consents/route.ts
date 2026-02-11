import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { updateConsent, getAllConsents } from '@/lib/gdpr-consent';

/**
 * API per gestione consensi GDPR
 */

export const dynamic = 'force-dynamic';

// GET - Ottieni tutti i consensi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID richiesto' },
        { status: 400 }
      );
    }

    const consents = await getAllConsents(guestId);

    return NextResponse.json({
      success: true,
      consents,
    });

  } catch (error) {
    console.error('[GDPR Consents GET] Errore:', error);
    return NextResponse.json(
      {
        error: 'Errore durante il recupero dei consensi',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Aggiorna consenso
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
    const { guestId, consentType, granted } = body;

    if (!guestId || !consentType || typeof granted !== 'boolean') {
      return NextResponse.json(
        { error: 'Parametri mancanti o non validi' },
        { status: 400 }
      );
    }

    // Estrai metadata dalla richiesta
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await updateConsent(guestId, consentType, granted, {
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: `Consenso ${granted ? 'concesso' : 'revocato'} con successo`,
    });

  } catch (error) {
    console.error('[GDPR Consents POST] Errore:', error);
    return NextResponse.json(
      {
        error: 'Errore durante l\'aggiornamento del consenso',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
