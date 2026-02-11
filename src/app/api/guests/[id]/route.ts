import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

/**
 * GET /api/guests/[id]
 * Dettaglio singolo cliente con storico completo
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  if (!['ADMIN', 'ORGANIZER', 'STAFF', 'PR'].includes(user.role)) {
    return ApiErrors.forbidden();
  }

  try {
    const { id } = await params;

    const guest = await prisma.guest.findUnique({
      where: { id },
      include: {
        listEntries: {
          include: {
            list: {
              select: {
                name: true,
                type: true,
                event: {
                  select: {
                    id: true,
                    title: true,
                    dateStart: true,
                    venue: {
                      select: {
                        name: true,
                        city: true,
                      },
                    },
                  },
                },
              },
            },
            tickets: {
              include: {
                checkins: {
                  select: {
                    scannedAt: true,
                    gate: true,
                    groupSize: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        preferences: true,
        feedbacks: {
          include: {
            event: {
              select: {
                title: true,
                dateStart: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        securityNotes: {
          include: {
            event: {
              select: {
                title: true,
                dateStart: true,
              },
            },
            reportedBy: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!guest) {
      return ApiErrors.notFound('Cliente');
    }

    // Calcola statistiche
    const stats = {
      totalEvents: guest.totalEvents,
      lastEventDate: guest.lastEventDate,
      totalListEntries: guest.listEntries.length,
      totalCheckins: guest.listEntries.reduce(
        (sum, entry) => sum + entry.tickets.reduce((s, t) => s + t.checkins.length, 0),
        0
      ),
      avgGroupSize: guest.averageGroupSize,
      customerSegment: guest.customerSegment,
    };

    return createApiResponse({
      guest,
      stats,
    });
  } catch (error) {
    console.error('Get guest detail error:', error);
    return ApiErrors.internal('Errore durante il recupero del cliente');
  }
}

/**
 * PATCH /api/guests/[id]
 * Aggiorna dati cliente
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  if (!['ADMIN', 'ORGANIZER', 'STAFF'].includes(user.role)) {
    return ApiErrors.forbidden();
  }

  try {
    const { id } = await params;
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      nickname,
      birthDate,
      city,
      occupation,
      instagram,
    } = body;

    // Verifica esistenza
    const existing = await prisma.guest.findUnique({
      where: { id },
    });

    if (!existing) {
      return ApiErrors.notFound('Cliente');
    }

    // Valida Instagram se presente
    let instagramHandle = instagram;
    if (instagramHandle) {
      instagramHandle = instagramHandle.trim().replace(/^@/, '');
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(instagramHandle)) {
        return ApiErrors.badRequest('Handle Instagram non valido');
      }
    }

    // Valida data nascita se presente
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      if (age < 16) {
        return ApiErrors.badRequest('Il cliente deve avere almeno 16 anni');
      }
    }

    // Aggiorna
    const updated = await prisma.guest.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email !== undefined && { email: email || null }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(nickname !== undefined && { nickname: nickname || null }),
        ...(birthDate !== undefined && { birthDate: birthDate ? new Date(birthDate) : null }),
        ...(city !== undefined && { city: city || null }),
        ...(occupation !== undefined && { occupation: occupation || null }),
        ...(instagram !== undefined && { instagram: instagramHandle || null }),
      },
    });

    return createApiResponse(updated);
  } catch (error) {
    console.error('Update guest error:', error);
    return ApiErrors.internal('Errore durante l\'aggiornamento del cliente');
  }
}

/**
 * DELETE /api/guests/[id]
 * Elimina cliente (soft delete - marca come DORMANT)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  if (user.role !== 'ADMIN') {
    return ApiErrors.forbidden();
  }

  try {
    const { id } = await params;

    const guest = await prisma.guest.findUnique({
      where: { id },
    });

    if (!guest) {
      return ApiErrors.notFound('Cliente');
    }

    // Soft delete: marca come DORMANT invece di eliminare
    await prisma.guest.update({
      where: { id },
      data: {
        customerSegment: 'DORMANT',
      },
    });

    return createApiResponse({ message: 'Cliente eliminato con successo' });
  } catch (error) {
    console.error('Delete guest error:', error);
    return ApiErrors.internal('Errore durante l\'eliminazione del cliente');
  }
}
