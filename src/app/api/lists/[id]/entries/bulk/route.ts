import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import {
  createApiResponse,
  requireAuth,
  validateInput,
  ApiErrors,
  createAuditLog,
} from '@/lib/api';

const BulkActionSchema = z.object({
  entryIds: z.array(z.string().cuid()).min(1, 'Seleziona almeno una persona').max(100, 'Massimo 100 persone per operazione'),
  action: z.enum(['APPROVE', 'REJECT']),
});

type BulkActionInput = z.infer<typeof BulkActionSchema>;

/**
 * PATCH /api/lists/[id]/entries/bulk
 * Bulk approve or reject list entries
 * 
 * Body: { entryIds: string[], action: 'APPROVE' | 'REJECT' }
 * Authorization: List owner, assigned PR, or admin
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth([
    'PR',
    'ORGANIZER',
    'ADMIN',
  ]);
  if (authError) return authError;

  try {
    const { id: listId } = await context.params;
    const body = await req.json();

    // Validate input
    const { data: validatedData, error } = validateInput(BulkActionSchema, body);
    if (error) return error;

    const { entryIds, action } = validatedData as BulkActionInput;

    // Fetch list with authorization check
    const list = await prisma.list.findUnique({
      where: { id: listId },
      include: {
        event: {
          include: {
            assignments: {
              include: {
                prProfile: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!list) {
      return ApiErrors.notFound('List');
    }

    // Authorization: owner, assigned PR, or admin
    const isOwner = list.event.createdByUserId === user.id;
    type AssignmentRelation = (typeof list.event.assignments)[number];
    const isAssignedPR = list.event.assignments.some(
      (assignment: AssignmentRelation) =>
        assignment.prProfile?.user?.id === user.id
    );

    if (!isOwner && !isAssignedPR && user.role !== 'ADMIN') {
      return ApiErrors.forbidden();
    }

    // Verify all entries belong to this list (security check)
    const entriesToUpdate = await prisma.listEntry.findMany({
      where: {
        id: { in: entryIds },
        listId,
      },
      select: { id: true },
    });

    if (entriesToUpdate.length !== entryIds.length) {
      return createApiResponse(
        undefined,
        `Alcune persone non appartengono a questa lista o non esistono`,
        400
      );
    }

    // Map action to status
    const newStatus = action === 'APPROVE' ? 'CONFIRMED' : 'REJECTED';

    // Atomic update via transaction
    const updatedEntries = await prisma.$transaction(async (tx) => {
      const updated = await tx.listEntry.updateMany({
        where: {
          id: { in: entryIds },
          listId,
        },
        data: {
          status: newStatus,
        },
      });

      return updated;
    });

    // Audit log
    await createAuditLog(
      user.id,
      'list.bulk_update_entries',
      'List',
      listId,
      {
        action,
        count: updatedEntries.count,
        newStatus,
      }
    );

    return createApiResponse(
      { updated: updatedEntries.count, status: newStatus },
      `${updatedEntries.count} ${updatedEntries.count === 1 ? 'persona aggiornata' : 'persone aggiornate'}`
    );
  } catch (error) {
    console.error('Bulk update error:', error);
    return ApiErrors.internal('Errore durante l\'aggiornamento');
  }
}
