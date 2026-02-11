import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { 
  CreateEventSchema, 
  UpdateEventSchema,
  EventFilters,
  PaginationParams 
} from '@/lib/validations';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  getSearchParams,
  createAuditLog,
  getCurrentUser
} from '@/lib/api';

/**
 * GET /api/events
 * List events with pagination and filters
 */
export async function GET(req: NextRequest) {
  try {
    const params = getSearchParams(req);
    
    const { data: paginationData, error: paginationError } = 
      validateInput(PaginationParams, params);
    if (paginationError) return paginationError;

    const { data: filtersData, error: filtersError } = 
      validateInput(EventFilters, params);
    if (filtersError) return filtersError;

    const { page, limit } = paginationData!;
    const { city, dateFrom, dateTo, status } = filtersData!;

    // Check if user is authenticated (optional auth)
    const user = await getCurrentUser();

    const where: any = {};
    
    if (city) {
      where.venue = { city: { contains: city, mode: 'insensitive' } };
    }
    
    if (dateFrom || dateTo) {
      where.dateStart = {};
      if (dateFrom) where.dateStart.gte = new Date(dateFrom);
      if (dateTo) where.dateStart.lte = new Date(dateTo);
    }
    
    if (status) {
      where.status = status;
    } else if (!user) {
      // Public endpoint (not authenticated) only shows published events
      where.status = 'PUBLISHED';
    }
    // If user is authenticated and no status filter, show all events

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          venue: true,
          _count: {
            select: {
              tickets: true,
              lists: true,
            },
          },
        },
        orderBy: { dateStart: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return createApiResponse({ events, pagination });
  } catch (error) {
    console.error('Events list error:', error);
    return ApiErrors.internal('Failed to fetch events');
  }
}

/**
 * POST /api/events
 * Create a new event (ORGANIZER/ADMIN only)
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const body = await req.json();
    
    const { data: validatedData, error } = validateInput(CreateEventSchema, body);
    if (error) return error;

    const eventData = validatedData!;

    // Validate venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: eventData.venueId },
    });

    if (!venue) {
      return ApiErrors.notFound('Venue');
    }

    // Validate dates
    const dateStart = new Date(eventData.dateStart);
    const dateEnd = eventData.dateEnd ? new Date(eventData.dateEnd) : null;
    
    if (dateEnd && dateEnd <= dateStart) {
      return ApiErrors.badRequest('End date must be after start date');
    }

    const event = await prisma.event.create({
      data: {
        ...eventData,
        dateStart,
        dateEnd,
        createdByUserId: user.id,
      },
      include: {
        venue: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Audit log
    await createAuditLog(
      user.id,
      'event.create',
      'Event',
      event.id,
      { title: event.title }
    );

    return createApiResponse(event, undefined, 201);
  } catch (error) {
    console.error('Event creation error:', error);
    return ApiErrors.internal('Failed to create event');
  }
}