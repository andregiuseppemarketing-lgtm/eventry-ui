import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

/**
 * GET /api/venues
 * List all venues
 */
export async function GET() {
  try {
    const venues = await prisma.venue.findMany({
      orderBy: { name: 'asc' },
    });

    return createApiResponse(venues);
  } catch (error) {
    console.error('Venues list error:', error);
    return ApiErrors.internal('Failed to fetch venues');
  }
}

/**
 * POST /api/venues
 * Create a new venue (ADMIN only)
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['ADMIN']);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { name, address, city, capacity } = body;

    if (!name || !address || !city) {
      return ApiErrors.badRequest('Name, address and city are required');
    }

    const venue = await prisma.venue.create({
      data: {
        name,
        address,
        city,
        capacity: capacity ? parseInt(capacity) : null,
      },
    });

    return createApiResponse(venue, undefined, 201);
  } catch (error) {
    console.error('Venue creation error:', error);
    return ApiErrors.internal('Failed to create venue');
  }
}
