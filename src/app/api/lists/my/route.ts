import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

/**
 * GET /api/lists/my
 * Get all lists accessible by current user (as PR or owner)
 */
export async function GET(req: NextRequest) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  try {
    const isAdmin = user.role === 'ADMIN';
    const isOrganizer = user.role === 'ORGANIZER';

    // Build query based on role
    const where: any = {};

    if (!isAdmin) {
      // Non-admins see only their lists or lists they're assigned to as PR
      where.OR = [];

      if (isOrganizer) {
        // Organizers see lists from their events
        where.OR.push({
          event: {
            createdByUserId: user.id,
          },
        });
      }

      // PR users see lists they're assigned to
      where.OR.push({
        event: {
          assignments: {
            some: {
              prProfile: {
                userId: user.id,
              },
            },
          },
        },
      });

      // If no conditions, return empty
      if (where.OR.length === 0) {
        return createApiResponse({ lists: [] });
      }
    }

    const lists = await prisma.list.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            dateStart: true,
            status: true,
          },
        },
        _count: {
          select: {
            entries: true,
          },
        },
      },
      orderBy: {
        event: {
          dateStart: 'desc',
        },
      },
    });

    return createApiResponse({ lists });
  } catch (error) {
    console.error('Fetch my lists error:', error);
    return ApiErrors.internal('Failed to fetch lists');
  }
}
