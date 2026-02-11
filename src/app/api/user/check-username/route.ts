import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/check-username
 * Verifica disponibilità username (real-time validation)
 * Query param: ?username=johnny_rossi
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username mancante' }, { status: 400 });
    }

    // Validate format
    const usernameRegex = /^[a-zA-Z0-9._]{3,30}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ 
        available: false, 
        error: 'Formato non valido' 
      }, { status: 400 });
    }

    // Check if username exists (case-insensitive)
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });

    const available = !existingUser;

    console.log('[Check Username]', username, '→', available ? 'Available' : 'Taken');

    return NextResponse.json({ 
      available,
      username: username.toLowerCase() 
    });
  } catch (error) {
    console.error('[Check Username] Error:', error);
    return NextResponse.json(
      { error: 'Errore durante la verifica' },
      { status: 500 }
    );
  }
}
