import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validateSlug, sanitizeSlugInput } from '@/lib/slug';
import { z } from 'zod';

const updateSlugSchema = z.object({
  slug: z.string().min(3).max(50),
});

/**
 * Update user profile slug
 * PUT /api/profile/slug
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { slug } = updateSlugSchema.parse(body);

    // Sanitize and validate slug
    const sanitized = sanitizeSlugInput(slug);
    if (!validateSlug(sanitized)) {
      return NextResponse.json(
        { error: 'Slug non valido. Usa solo lettere minuscole, numeri e trattini.' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await prisma.userProfile.findUnique({
      where: { slug: sanitized },
    });

    if (existing && existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Questo slug è già in uso. Scegline un altro.' },
        { status: 409 }
      );
    }

    // Update user profile
    const profile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { slug: sanitized },
    });

    return NextResponse.json({ 
      success: true, 
      slug: profile.slug,
      url: `/u/${profile.slug}` 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Dati non validi' }, { status: 400 });
    }
    
    console.error('Error updating slug:', error);
    return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 });
  }
}
