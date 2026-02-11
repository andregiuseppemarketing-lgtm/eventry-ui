import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createApiResponse, requireAuth, ApiErrors } from '@/lib/api';

/**
 * GET /api/guests?search=&segment=&city=&page=1&limit=20
 * Lista clienti con filtri avanzati e paginazione
 */
export async function GET(req: NextRequest) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  // Solo ADMIN, ORGANIZER e STAFF possono vedere i clienti
  if (!['ADMIN', 'ORGANIZER', 'STAFF'].includes(user.role)) {
    return ApiErrors.forbidden();
  }

  try {
    const { searchParams } = new URL(req.url);
    
    // Parametri di ricerca
    const search = searchParams.get('search') || '';
    const segment = searchParams.get('segment') || ''; // NEW, OCCASIONAL, REGULAR, VIP, DORMANT
    const city = searchParams.get('city') || '';
    const hasInstagram = searchParams.get('hasInstagram'); // 'true' | 'false'
    const minEvents = searchParams.get('minEvents'); // numero minimo eventi
    const maxEvents = searchParams.get('maxEvents'); // numero massimo eventi
    const orderBy = searchParams.get('orderBy') || 'lastEventDate'; // lastEventDate, totalEvents, firstName
    const order = searchParams.get('order') || 'desc'; // asc, desc
    
    // Paginazione
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Costruisci filtro where
    const where: any = {};

    // Ricerca testuale (nome, cognome, email, telefono, instagram)
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { instagram: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filtro per segmento
    if (segment) {
      where.customerSegment = segment;
    }

    // Filtro per città
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Filtro per presenza Instagram
    if (hasInstagram === 'true') {
      where.instagram = { not: null };
    } else if (hasInstagram === 'false') {
      where.instagram = null;
    }

    // Filtro per numero eventi
    if (minEvents) {
      where.totalEvents = { gte: parseInt(minEvents) };
    }
    if (maxEvents) {
      if (where.totalEvents) {
        where.totalEvents.lte = parseInt(maxEvents);
      } else {
        where.totalEvents = { lte: parseInt(maxEvents) };
      }
    }

    // Costruisci orderBy
    const orderByClause: any = {};
    if (orderBy === 'lastEventDate') {
      orderByClause.lastEventDate = order;
    } else if (orderBy === 'totalEvents') {
      orderByClause.totalEvents = order;
    } else if (orderBy === 'firstName') {
      orderByClause.firstName = order;
    } else {
      orderByClause.updatedAt = 'desc';
    }

    // Query con paginazione
    const [guests, total] = await Promise.all([
      prisma.guest.findMany({
        where,
        orderBy: orderByClause,
        skip,
        take: limit,
        include: {
          listEntries: {
            select: {
              id: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              listEntries: true,
            },
          },
        },
      }),
      prisma.guest.count({ where }),
    ]);

    return createApiResponse({
      guests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get guests error:', error);
    return ApiErrors.internal('Errore durante il recupero dei clienti');
  }
}

/**
 * POST /api/guests
 * Crea un nuovo cliente
 */
export async function POST(req: NextRequest) {
  const { error: authError, user } = await requireAuth();
  if (authError) return authError;

  if (!['ADMIN', 'ORGANIZER', 'STAFF'].includes(user.role)) {
    return ApiErrors.forbidden();
  }

  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      city,
      occupation,
      instagram,
    } = body;

    // Validazione campi obbligatori
    if (!firstName || !lastName) {
      return ApiErrors.badRequest('Nome e cognome sono obbligatori');
    }

    // Verifica duplicati (email o phone)
    if (email || phone) {
      const existing = await prisma.guest.findFirst({
        where: {
          OR: [
            email ? { email } : {},
            phone ? { phone } : {},
          ].filter(obj => Object.keys(obj).length > 0),
        },
      });

      if (existing) {
        return ApiErrors.badRequest('Cliente già esistente con questa email o telefono');
      }
    }

    // Validazione data di nascita (età minima 16 anni)
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      if (age < 16) {
        return ApiErrors.badRequest('Il cliente deve avere almeno 16 anni');
      }
    }

    // Normalizza Instagram handle
    let instagramHandle = instagram;
    if (instagramHandle) {
      instagramHandle = instagramHandle.trim().replace(/^@/, '');
      // Valida formato Instagram (solo lettere, numeri, underscore, punto)
      if (!/^[a-zA-Z0-9._]{1,30}$/.test(instagramHandle)) {
        return ApiErrors.badRequest('Handle Instagram non valido');
      }
    }

    // Crea guest
    const guest = await prisma.guest.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        birthDate: birthDate ? new Date(birthDate) : null,
        occupation: occupation || null,
        instagram: instagramHandle || null,
        customerSegment: 'NEW',
      },
    });

    return createApiResponse(guest, undefined, 201);
  } catch (error) {
    console.error('Create guest error:', error);
    return ApiErrors.internal('Errore durante la creazione del cliente');
  }
}
