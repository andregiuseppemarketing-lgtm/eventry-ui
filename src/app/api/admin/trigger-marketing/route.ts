import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';

/**
 * Endpoint per triggerare manualmente automazioni marketing
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

    // Leggi tipo di automazione dal body
    const body = await request.json();
    const { type = 'all' } = body;

    // Valida tipo
    const validTypes = ['all', 'birthday', 're-engagement', 'vip'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo di automazione non valido' },
        { status: 400 }
      );
    }

    // Chiama l'endpoint di automazione
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const cronSecret = process.env.CRON_SECRET;
    
    const response = await fetch(`${baseUrl}/api/cron/marketing-automation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cronSecret && { 'Authorization': `Bearer ${cronSecret}` }),
      },
      body: JSON.stringify({ type }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Errore durante l\'esecuzione');
    }

    return NextResponse.json({
      success: true,
      message: 'Automazioni marketing eseguite con successo',
      data,
    });

  } catch (error) {
    console.error('[Admin] Errore trigger marketing:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante il trigger delle automazioni',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
