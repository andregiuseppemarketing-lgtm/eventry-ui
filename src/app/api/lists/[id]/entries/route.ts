import { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import {
  CreateListEntrySchema,
  BulkCreateListEntrySchema,
  PaginationParams,
  type CreateListEntryInput,
  type BulkCreateListEntryInput,
  EntryStatus,
  Gender,
} from '@/lib/validations';
import {
  createApiResponse,
  requireAuth,
  validateInput,
  ApiErrors,
  getSearchParams,
  createAuditLog,
} from '@/lib/api';
import { canJoinEventList } from '@/lib/age-verification';

function normalizeQueryValue(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

/**
 * GET /api/lists/[id]/entries
 * Get list entries with pagination and filters.
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  try {
    const { id } = await context.params;
    const query = getSearchParams(req);

    // Validate pagination parameters from query string.
    const { data: paginationData, error: paginationError } = validateInput(
      PaginationParams,
      query
    );
    if (paginationError) return paginationError;

    const { page, limit } = paginationData!;
    const search = normalizeQueryValue(query.search);
    const status = normalizeQueryValue(query.status);
    const gender = normalizeQueryValue(query.gender);

    const list = await prisma.list.findUnique({
      where: { id },
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

    const isOwner = list.event.createdByUserId === user.id;
    type AssignmentWithRelations = (typeof list.event.assignments)[number];
    const isAssignedPR = list.event.assignments.some(
      (assignment: AssignmentWithRelations) =>
        assignment.prProfile?.user?.id === user.id
    );
    const isStaffOrAdmin = user.role === 'STAFF' || user.role === 'ADMIN';

    if (!isOwner && !isAssignedPR && !isStaffOrAdmin) {
      return ApiErrors.forbidden();
    }

  const where: any = { listId: id };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    if (status) {
      const parsedStatus = EntryStatus.safeParse(status);
      if (parsedStatus.success) {
        where.status = parsedStatus.data;
      }
    }

    if (gender) {
      const parsedGender = Gender.safeParse(gender);
      if (parsedGender.success) {
        where.gender = parsedGender.data;
      }
    }

    const [entries, total] = await Promise.all([
      prisma.listEntry.findMany({
        where,
        include: {
          addedBy: {
            select: { id: true, name: true },
          },
          tickets: {
            select: { id: true, code: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
  prisma.listEntry.count({ where }),
    ]);

    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };

    return createApiResponse({ entries, pagination });
  } catch (error) {
    console.error('List entries fetch error:', error);
    return ApiErrors.internal('Failed to fetch list entries');
  }
}

/**
 * POST /api/lists/[id]/entries
 * Add entry to list (single or bulk).
 */
export async function POST(
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
    const { id } = await context.params;
    const body = await req.json();
    const isBulk = Array.isArray((body as { entries?: unknown }).entries);

    // Check identity verification for joining lists
    if (!user.identityVerified) {
      return createApiResponse(
        undefined,
        'Devi verificare la tua identità per iscriverti alle liste eventi',
        403
      );
    }

    const { data: validatedData, error } = validateInput(
      isBulk ? BulkCreateListEntrySchema : CreateListEntrySchema,
      body
    );
    if (error) return error;

    const list = await prisma.list.findUnique({
      where: { id },
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

    const isOwner = list.event.createdByUserId === user.id;
    type AssignmentRelation = (typeof list.event.assignments)[number];
    const isAssignedPR = list.event.assignments.some(
      (assignment: AssignmentRelation) =>
        assignment.prProfile?.user?.id === user.id
    );

    if (!isOwner && !isAssignedPR && user.role !== 'ADMIN') {
      return ApiErrors.forbidden();
    }

    if (isBulk) {
      const { entries } = validatedData as BulkCreateListEntryInput;

      const createdEntries = await Promise.all(
        entries.map((entry: CreateListEntryInput) =>
          prisma.listEntry.create({
            data: {
              ...entry,
              listId: id,
              addedByUserId: user.id,
              createdVia: 'IMPORT',
            },
            include: {
              addedBy: {
                select: { id: true, name: true },
              },
            },
          })
        )
      );

      await createAuditLog(
        user.id,
        'list.bulk_add_entries',
        'List',
        id,
        { count: entries.length }
      );

      return createApiResponse(createdEntries, undefined, 201);
    }

    const singleEntry = validatedData as CreateListEntryInput;

    const entry = await prisma.listEntry.create({
      data: {
        ...singleEntry,
        listId: id,
        addedByUserId: user.id,
        createdVia: 'MANUAL',
      },
      include: {
        addedBy: {
          select: { id: true, name: true },
        },
      },
    });

    await createAuditLog(
      user.id,
      'list.add_entry',
      'ListEntry',
      entry.id,
      { name: `${entry.firstName} ${entry.lastName}` }
    );

    return createApiResponse(entry, undefined, 201);
  } catch (error) {
    console.error('List entry creation error:', error);
    return ApiErrors.internal('Failed to create list entry');
  }
}