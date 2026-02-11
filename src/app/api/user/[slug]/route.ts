import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const userProfile = await prisma.userProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Profilo non trovato' },
        { status: 404 }
      );
    }

    // Se il profilo è privato, nascondi alcune info
    if (!userProfile.isPublic) {
      return NextResponse.json({
        slug: userProfile.slug,
        name: userProfile.user.name,
        avatar: userProfile.avatar,
        isPublic: false,
      });
    }

    return NextResponse.json({
      id: userProfile.user.id,
      slug: userProfile.slug,
      name: userProfile.user.name,
      firstName: userProfile.user.firstName,
      lastName: userProfile.user.lastName,
      avatar: userProfile.avatar,
      coverImage: userProfile.coverImage,
      bio: userProfile.bio,
      city: userProfile.city,
      provincia: userProfile.provincia,
      instagram: userProfile.instagram,
      tiktokHandle: userProfile.tiktokHandle,
      spotifyUrl: userProfile.spotifyUrl,
      telegramHandle: userProfile.telegramHandle,
      whatsappNumber: userProfile.whatsappNumber,
      role: userProfile.user.role,
      followersCount: userProfile.followersCount,
      followingCount: userProfile.followingCount,
      postsCount: userProfile.postsCount,
      verifiedBadge: userProfile.verifiedBadge,
      createdAt: userProfile.user.createdAt,
    });
  } catch (error) {
    console.error('[API] Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    );
  }
}
