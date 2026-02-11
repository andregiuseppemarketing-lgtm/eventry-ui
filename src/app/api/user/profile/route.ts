import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/user/profile
 * Restituisce i dati completi del profilo utente autenticato
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Query completa dell'utente con tutti i dati necessari
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        username: true,
        displayName: true,
        image: true,
        birthDate: true,
        age: true,
        role: true,
        createdAt: true,
        userProfile: {
          select: {
            bio: true,
            city: true,
            provincia: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // TODO: Query stats reali (followers, following, events)
    const stats = {
      followers: 0,
      following: 0,
      eventsAttended: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.image,
        bio: user.userProfile?.bio || null,
        birthDate: user.birthDate,
        age: user.age,
        city: user.userProfile?.city || null,
        provincia: user.userProfile?.provincia || null,
        role: user.role,
        stats,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('[User Profile API] Error:', error);
    return NextResponse.json(
      { error: 'Errore durante il recupero del profilo' },
      { status: 500 }
    );
  }
}
