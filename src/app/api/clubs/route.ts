import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  getSearchParams,
  createAuditLog 
} from '@/lib/api';
import { calculateAge } from '@/lib/age-verification';
import { z } from 'zod';

const CreateClubSchema = z.object({
  name: z.string().min(1, 'Nome richiesto'),
  type: z.enum(['DISCOTECA', 'PUB', 'LIDO', 'ALTRO']),
  description: z.string().optional(),
  logo: z.string().optional(),
  coverImage: z.string().optional(),
  gallery: z.array(z.string()).optional().default([]),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  openingHours: z.string().optional(),
  priceRange: z.string().optional(),
  amenities: z.array(z.string()).optional().default([]),
  musicGenres: z.array(z.string()).optional().default([]),
});

const UpdateClubSchema = CreateClubSchema.partial();

/**
 * GET /api/clubs
 * Lista club (filtrati per owner se ORGANIZER)
 */
export async function GET(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const where: any = {};
    
    // ORGANIZER vede solo i propri club, ADMIN vede tutti
    if (user!.role === 'ORGANIZER') {
      where.ownerId = user!.id;
    }

    const clubs = await prisma.club.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        venues: true,
        _count: {
          select: {
            venues: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return createApiResponse({ clubs });
  } catch (error) {
    console.error('Clubs list error:', error);
    return ApiErrors.internal('Failed to fetch clubs');
  }
}

/**
 * POST /api/clubs
 * Crea nuovo club (ORGANIZER/ADMIN)
 * Richiede: Identity verified + 21+ anni
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    // Check identity verification
    if (!user!.identityVerified) {
      return createApiResponse(
        undefined,
        'Devi verificare la tua identità per creare un club',
        403
      );
    }

    // Check age (21+)
    if (user!.birthDate) {
      const age = calculateAge(new Date(user!.birthDate));
      if (age < 21) {
        return createApiResponse(
          undefined,
          'Devi avere almeno 21 anni per creare un club',
          403
        );
      }
    }

    const body = await req.json();
    
    const { data: validatedData, error } = validateInput(CreateClubSchema, body);
    if (error) return error;

    const club = await prisma.club.create({
      data: {
        ...validatedData!,
        ownerId: user!.id,
      },
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
      'CREATE',
      'Club',
      club.id,
      { name: club.name, type: club.type }
    );

    return createApiResponse({ club }, undefined, 201);
  } catch (error) {
    console.error('Create club error:', error);
    return ApiErrors.internal('Failed to create club');
  }
}
