import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

type ValidationIssue = string;

interface PublishValidationResult {
  canPublish: boolean;
  issues: ValidationIssue[];
  warnings: ValidationIssue[];
  completeness: number; // 0-100
}

/**
 * GET /api/events/[id]/validate-publish
 * 
 * Validates if an event is ready to be published.
 * Returns blocking issues and warnings.
 * 
 * Authorization: Event owner or ADMIN
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth(['ORGANIZER', 'ADMIN']);
  if (authError) return authError;

  try {
    const { id: eventId } = await context.params;

    // Fetch event with relations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        venue: true,
        lists: {
          select: { id: true },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      return ApiErrors.notFound('Event');
    }

    // Authorization check
    if (event.createdByUserId !== user.id && user.role !== 'ADMIN') {
      return ApiErrors.forbidden();
    }

    // Validation logic
    const issues: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    let score = 0;
    const maxScore = 5;

    // 1. Title validation (BLOCKING)
    if (!event.title || event.title.trim().length < 3) {
      issues.push('Il titolo è troppo corto (minimo 3 caratteri)');
    } else if (event.title.trim().length < 5) {
      issues.push('Il titolo dovrebbe essere più descrittivo (minimo 5 caratteri)');
    } else {
      score++;
    }

    // 2. Description validation (BLOCKING)
    if (!event.description || event.description.trim().length === 0) {
      issues.push('La descrizione è obbligatoria');
    } else if (event.description.trim().length < 20) {
      issues.push('La descrizione è troppo breve (minimo 20 caratteri)');
    } else {
      score++;
    }

    // 3. Cover image validation (BLOCKING)
    if (!event.coverUrl || event.coverUrl.trim().length === 0) {
      issues.push('La locandina è obbligatoria per pubblicare l\'evento');
    } else {
      score++;
    }

    // 4. Venue validation (BLOCKING - already required by schema)
    if (!event.venue) {
      issues.push('La location dell\'evento è obbligatoria');
    } else {
      score++;
    }

    // 5. Date validation (BLOCKING)
    const now = new Date();
    const eventDate = new Date(event.dateStart);
    
    if (eventDate <= now) {
      issues.push('La data dell\'evento deve essere nel futuro');
    } else {
      score++;
    }

    // 6. Lists/Tickets warning (NON-BLOCKING)
    if (event.lists.length === 0 && event._count.tickets === 0) {
      warnings.push('Nessuna lista o biglietto configurato. Considera di creare almeno una lista ingressi.');
    }

    // 7. Date end validation (WARNING)
    if (!event.dateEnd) {
      warnings.push('Data di fine evento non specificata. Considera di aggiungerla per maggiore chiarezza.');
    }

    // Calculate completeness percentage
    const completeness = Math.round((score / maxScore) * 100);

    const result: PublishValidationResult = {
      canPublish: issues.length === 0,
      issues,
      warnings,
      completeness,
    };

    return createApiResponse(result);
  } catch (error) {
    console.error('Publish validation error:', error);
    return ApiErrors.internal('Failed to validate event for publish');
  }
}
