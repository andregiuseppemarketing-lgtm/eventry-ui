import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimitOr429, getClientIp } from '@/lib/ratelimit';

/**
 * POST /api/follow
 * Follow un utente
 * 
 * Rate Limit: 120 follow/unfollow per hour per user
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    // Rate limiting: 120 follow/unfollow per hour per user
    const rateLimitResult = await rateLimitOr429(req, {
      key: 'follow',
      identifier: session.user.id,
      limit: 120,
      window: '1h',
    });

    if (!rateLimitResult.ok) {
      return rateLimitResult.response;
    }

    const { followingId } = await req.json();

    if (!followingId) {
      return NextResponse.json(
        { error: 'followingId richiesto' },
        { status: 400 }
      );
    }

    // Non puoi seguire te stesso
    if (session.user.id === followingId) {
      return NextResponse.json(
        { error: 'Non puoi seguire te stesso' },
        { status: 400 }
      );
    }

    // Verifica che l'utente da seguire esista
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return NextResponse.json(
        { error: 'Utente non trovato' },
        { status: 404 }
      );
    }

    // Verifica se già segui questo utente
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json(
        { error: 'Stai già seguendo questo utente' },
        { status: 400 }
      );
    }

    // Crea il follow e aggiorna i contatori
    const follow = await prisma.$transaction(async (tx) => {
      // Crea follow
      const newFollow = await tx.userFollow.create({
        data: {
          followerId: session.user.id,
          followingId,
        },
      });

      // Incrementa followingCount per chi segue
      const followerProfile = await tx.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (followerProfile) {
        await tx.userProfile.update({
          where: { userId: session.user.id },
          data: { followingCount: { increment: 1 } },
        });
      }

      // Incrementa followersCount per chi viene seguito
      const followingProfile = await tx.userProfile.findUnique({
        where: { userId: followingId },
      });

      if (followingProfile) {
        await tx.userProfile.update({
          where: { userId: followingId },
          data: { followersCount: { increment: 1 } },
        });
      }

      return newFollow;
    });

    return NextResponse.json({
      success: true,
      data: follow,
    });
  } catch (error) {
    console.error('[API] Error creating follow:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/follow
 * Unfollow un utente
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non autenticato' },
        { status: 401 }
      );
    }

    const { followingId } = await req.json();

    if (!followingId) {
      return NextResponse.json(
        { error: 'followingId richiesto' },
        { status: 400 }
      );
    }

    // Verifica se esiste il follow
    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      return NextResponse.json(
        { error: 'Non stai seguendo questo utente' },
        { status: 400 }
      );
    }

    // Elimina il follow e aggiorna i contatori
    await prisma.$transaction(async (tx) => {
      // Elimina follow
      await tx.userFollow.delete({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId,
          },
        },
      });

      // Decrementa followingCount per chi smette di seguire
      const followerProfile = await tx.userProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (followerProfile && followerProfile.followingCount > 0) {
        await tx.userProfile.update({
          where: { userId: session.user.id },
          data: { followingCount: { decrement: 1 } },
        });
      }

      // Decrementa followersCount per chi viene smesso di seguire
      const followingProfile = await tx.userProfile.findUnique({
        where: { userId: followingId },
      });

      if (followingProfile && followingProfile.followersCount > 0) {
        await tx.userProfile.update({
          where: { userId: followingId },
          data: { followersCount: { decrement: 1 } },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Unfollow eseguito con successo',
    });
  } catch (error) {
    console.error('[API] Error deleting follow:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/follow
 * Controlla se l'utente corrente segue un target
 * Query params: targetSlug o targetId
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ isFollowing: false });
    }

    const { searchParams } = new URL(req.url);
    const targetSlug = searchParams.get('targetSlug');
    const targetId = searchParams.get('targetId');

    if (!targetSlug && !targetId) {
      return NextResponse.json(
        { error: 'targetSlug o targetId richiesto' },
        { status: 400 }
      );
    }

    let followingId: string | null = null;

    if (targetSlug) {
      const targetProfile = await prisma.userProfile.findUnique({
        where: { slug: targetSlug },
        select: { userId: true },
      });
      followingId = targetProfile?.userId || null;
    } else if (targetId) {
      followingId = targetId;
    }

    if (!followingId) {
      return NextResponse.json({ isFollowing: false });
    }

    const existingFollow = await prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId,
        },
      },
    });

    return NextResponse.json({
      isFollowing: !!existingFollow,
      followingId,
    });
  } catch (error) {
    console.error('[API] Error checking follow status:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
