import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, ApiErrors, getSearchParams } from '@/lib/api';
import { EntryStatus, Gender } from '@/lib/validations';
import type { Prisma } from '@prisma/client';

function normalizeQueryValue(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function escapeCSV(value: string | null | undefined): string {
  if (!value) return '';
  const stringValue = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * GET /api/lists/[id]/entries/export
 * Export list entries as CSV with current filters applied
 * 
 * Query params: search, gender, status (same as GET /entries)
 * Authorization: List owner, assigned PR, or admin
 * Limit: 1000 entries max for performance
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  try {
    const { id: listId } = await context.params;
    const query = getSearchParams(req);

    // Parse filters (same as GET /entries)
    const search = normalizeQueryValue(query.search);
    const status = normalizeQueryValue(query.status);
    const gender = normalizeQueryValue(query.gender);

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

    // Authorization check
    const isOwner = list.event.createdByUserId === user.id;
    type AssignmentRelation = (typeof list.event.assignments)[number];
    const isAssignedPR = list.event.assignments.some(
      (assignment: AssignmentRelation) =>
        assignment.prProfile?.user?.id === user.id
    );
    const isStaffOrAdmin = user.role === 'STAFF' || user.role === 'ADMIN';

    if (!isOwner && !isAssignedPR && !isStaffOrAdmin) {
      return ApiErrors.forbidden();
    }

    // Build where clause (same as GET /entries)
    const where: Prisma.ListEntryWhereInput = { listId };

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

    // Fetch entries (limit 1000 for performance)
    const entries = await prisma.listEntry.findMany({
      where,
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        gender: true,
        status: true,
        plusOne: true,
        groupSize: true,
        createdAt: true,
        addedBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    if (entries.length === 0) {
      return new Response('Nessuna persona da esportare', { status: 404 });
    }

    // Build CSV
    const headers = [
      'Nome',
      'Cognome',
      'Email',
      'Telefono',
      'Genere',
      'Stato',
      'Plus One',
      'Gruppo',
      'Aggiunto Da',
      'Data Aggiunta',
    ];

    const rows = entries.map((entry) => [
      escapeCSV(entry.firstName),
      escapeCSV(entry.lastName),
      escapeCSV(entry.email),
      escapeCSV(entry.phone),
      escapeCSV(entry.gender),
      escapeCSV(entry.status),
      entry.plusOne ? 'Sì' : 'No',
      String(entry.groupSize || 1),
      escapeCSV(entry.addedBy?.name),
      new Date(entry.createdAt).toLocaleString('it-IT'),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    // Generate filename with event + list name + date
    const timestamp = new Date().toISOString().split('T')[0];
    const sanitizedListName = list.name.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `lista_${sanitizedListName}_${timestamp}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('CSV export error:', error);
    return ApiErrors.internal('Errore durante l\'esportazione');
  }
}
