import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  createAuditLog 
} from '@/lib/api';
import { z } from 'zod';

const UpdateClubSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['DISCOTECA', 'PUB', 'LIDO', 'ALTRO']).optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  openingHours: z.string().optional(),
  priceRange: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  musicGenres: z.array(z.string()).optional(),
});

/**
 * GET /api/clubs/[id]
 * Dettagli club specifico
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          }
        },
        venues: {
          include: {
            _count: {
              select: {
                events: true,
              }
            }
          }
        },
      }
    });

    if (!club) {
      return ApiErrors.notFound('Club');
    }

    // ORGANIZER può vedere solo i propri club
    if (user!.role === 'ORGANIZER' && club.ownerId !== user!.id) {
      return ApiErrors.forbidden();
    }

    return createApiResponse({ club });
  } catch (error) {
    console.error('Get club error:', error);
    return ApiErrors.internal('Failed to fetch club');
  }
}

/**
 * PATCH /api/clubs/[id]
 * Aggiorna club
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const club = await prisma.club.findUnique({
      where: { id },
    });

    if (!club) {
      return ApiErrors.notFound('Club');
    }

    // ORGANIZER può modificare solo i propri club
    if (user!.role === 'ORGANIZER' && club.ownerId !== user!.id) {
      return ApiErrors.forbidden();
    }

    const body = await req.json();
    const { data: validatedData, error } = validateInput(UpdateClubSchema, body);
    if (error) return error;

    const updatedClub = await prisma.club.update({
      where: { id },
      data: validatedData!,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        venues: true,
      }
    });

    // Audit log
    await createAuditLog(
      user!.id,
      'UPDATE',
      'Club',
      updatedClub.id,
      validatedData
    );

    return createApiResponse({ club: updatedClub });
  } catch (error) {
    console.error('Update club error:', error);
    return ApiErrors.internal('Failed to update club');
  }
}

/**
 * DELETE /api/clubs/[id]
 * Elimina club
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const club = await prisma.club.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            venues: true,
          }
        }
      }
    });

    if (!club) {
      return ApiErrors.notFound('Club');
    }

    // ORGANIZER può eliminare solo i propri club
    if (user!.role === 'ORGANIZER' && club.ownerId !== user!.id) {
      return ApiErrors.forbidden();
    }

    // Verifica che non ci siano venue associate
    if (club._count.venues > 0) {
      return ApiErrors.badRequest(
        'Non puoi eliminare un club con venue associate. Rimuovi prima le venue.'
      );
    }

    await prisma.club.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog(
      user!.id,
      'DELETE',
      'Club',
      id,
      { name: club.name }
    );

    return createApiResponse({ 
      success: true,
      message: 'Club eliminato con successo' 
    });
  } catch (error) {
    console.error('Delete club error:', error);
    return ApiErrors.internal('Failed to delete club');
  }
}
