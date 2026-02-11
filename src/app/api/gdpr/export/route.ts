import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { exportGuestData, generateDataExportFile, logDataExport } from '@/lib/gdpr-export';

/**
 * API per esportazione dati personali (GDPR Art. 15)
 * Permette agli utenti di scaricare tutti i propri dati
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // TODO: Collegare session.user a Guest
    // Per ora usa un parametro query
    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('guestId');

    if (!guestId) {
      return NextResponse.json(
        { error: 'Guest ID richiesto' },
        { status: 400 }
      );
    }

    // Verifica che l'utente possa accedere ai dati
    // (stesso utente o admin)
    if (session.user.role !== 'ADMIN') {
      // TODO: Verifica che guestId appartenga a session.user
    }

    // Esporta dati
    const data = await exportGuestData(guestId);

    // Log dell'export
    await logDataExport(guestId, session.user.id);

    // Genera file JSON
    const jsonContent = generateDataExportFile(data);

    // Ritorna come download
    return new NextResponse(jsonContent, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="my-data-${guestId}-${Date.now()}.json"`,
      },
    });

  } catch (error) {
    console.error('[GDPR Export] Errore:', error);
    return NextResponse.json(
      {
        error: 'Errore durante l\'esportazione dei dati',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
