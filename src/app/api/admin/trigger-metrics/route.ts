import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

/**
 * Endpoint per triggerare manualmente l'aggiornamento delle metriche
 * Solo per admin
 */

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Verifica autenticazione
    const session = await getServerSession(authConfig);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Chiama l'endpoint di aggiornamento metriche
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET;
    
    const response = await fetch(`${baseUrl}/api/cron/update-metrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cronSecret && { 'Authorization': `Bearer ${cronSecret}` }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Errore durante l\'aggiornamento');
    }

    return NextResponse.json({
      success: true,
      message: 'Metriche aggiornate con successo',
      data,
    });

  } catch (error) {
    console.error('[Admin] Errore trigger metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il trigger delle metriche',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
