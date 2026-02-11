import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UpdateEventSchema } from '@/lib/validations';
import { 
  createApiResponse, 
  requireAuth, 
  validateInput, 
  ApiErrors,
  createAuditLog 
} from '@/lib/api';

/**
 * GET /api/events/[id]
 * Get event by ID
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        venue: true,
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignments: {
          include: {
            prProfile: {
              include: {
                user: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
        lists: {
          include: {
            _count: {
              select: { entries: true },
            },
          },
        },
        _count: {
          select: {
            tickets: true,
            inviteLinks: true,
          },
        },
      },
    });

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    return createApiResponse(event);
  } catch (error) {
    console.error('Event fetch error:', error);
    return ApiErrors.internal('Failed to fetch event');
  }
}

/**
 * PATCH /api/events/[id]
 * Update event (ORGANIZER/ADMIN only)
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    const body = await req.json();
    
    const { data: validatedData, error } = validateInput(UpdateEventSchema, body);
    if (error) return error;

    const updateData = validatedData!;

    // Check if event exists
    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return ApiErrors.notFound('Event');
    }

    // Check permissions (only creator or admin can edit)
    if (existingEvent.createdByUserId !== user.id && user.role !== 'ADMIN') {
      return ApiErrors.forbidden();
    }

    // Validate venue if provided
    if (updateData.venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: updateData.venueId },
      });

      if (!venue) {
        return ApiErrors.notFound('Venue');
      }
    }

    // Validate dates
    if (updateData.dateStart || updateData.dateEnd) {
      const dateStart = updateData.dateStart ? 
        new Date(updateData.dateStart) : existingEvent.dateStart;
      const dateEnd = updateData.dateEnd ? 
        new Date(updateData.dateEnd) : existingEvent.dateEnd;
      
      if (dateEnd && dateEnd <= dateStart) {
        return ApiErrors.badRequest('End date must be after start date');
      }
    }

    const processedData: any = { ...updateData };
    if (updateData.dateStart) processedData.dateStart = new Date(updateData.dateStart);
    if (updateData.dateEnd) processedData.dateEnd = new Date(updateData.dateEnd);

    const event = await prisma.event.update({
      where: { id },
      data: processedData,
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
      'event.update',
      'Event',
      event.id,
      { changes: updateData }
    );

    return createApiResponse(event);
  } catch (error) {
    console.error('Event update error:', error);
    return ApiErrors.internal('Failed to update event');
  }
}

/**
 * DELETE /api/events/[id]
 * Delete event (ADMIN only)
 */
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth(['ADMIN']);
  if (authError) return authError;

  try {
    const { id } = await context.params;
    
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    await prisma.event.delete({
      where: { id },
    });

    // Audit log
    await createAuditLog(
      user.id,
      'event.delete',
      'Event',
      id,
      { title: event.title }
    );

    return createApiResponse({ success: true });
  } catch (error) {
    console.error('Event deletion error:', error);
    return ApiErrors.internal('Failed to delete event');
  }
}