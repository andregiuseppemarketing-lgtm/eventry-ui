import { NextRequest, NextResponse } from 'next/server';
import { sendBirthdayNotifications } from '@/scripts/birthday-notifications';
import { sendReEngagementCampaign } from '@/scripts/re-engagement';
import { runVIPAutomation } from '@/scripts/vip-automation';

/**
 * API endpoint per eseguire automazioni marketing
 * Può essere chiamato da cron job o manualmente
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minuti

export async function POST(request: NextRequest) {
  try {
    // Verifica token di sicurezza
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Non autorizzato' },
        { status: 401 }
      );
    }

    // Leggi il tipo di automazione dal body
    const body = await request.json().catch(() => ({}));
    const { type = 'all' } = body;

    console.log(`[Marketing] Esecuzione automazione: ${type}`);

    const results: Record<string, any> = {};

    // Esegui automazioni richieste
    if (type === 'all' || type === 'birthday') {
      try {
        console.log('[Marketing] Invio notifiche compleanno...');
        await sendBirthdayNotifications();
        results.birthday = { success: true };
      } catch (error) {
        console.error('[Marketing] Errore birthday:', error);
        results.birthday = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    if (type === 'all' || type === 're-engagement') {
      try {
        console.log('[Marketing] Campagna re-engagement...');
        await sendReEngagementCampaign();
        results.reEngagement = { success: true };
      } catch (error) {
        console.error('[Marketing] Errore re-engagement:', error);
        results.reEngagement = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    if (type === 'all' || type === 'vip') {
      try {
        console.log('[Marketing] Automazione VIP...');
        await runVIPAutomation();
        results.vip = { success: true };
      } catch (error) {
        console.error('[Marketing] Errore VIP:', error);
        results.vip = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }

    const allSuccess = Object.values(results).every((r: any) => r.success);

    return NextResponse.json({
      success: allSuccess,
      type,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('[Marketing] Errore generale:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Errore durante l\'esecuzione delle automazioni',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET per test in development
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Endpoint disponibile solo in development' },
      { status: 403 }
    );
  }

  return POST(request);
}
