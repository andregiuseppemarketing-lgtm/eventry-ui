/**
 * Configurazione ottimizzazioni performance database
 * Utilizza SELECT specifici invece di SELECT *
 */

// Campi essenziali User (evita di caricare tutto)
export const userSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
} as const;

// Campi essenziali Event
export const eventSelect = {
  id: true,
  title: true,
  dateStart: true,
  dateEnd: true,
  status: true,
  venue: {
    select: {
      id: true,
      name: true,
      city: true,
    },
  },
} as const;

// Campi essenziali Ticket
export const ticketSelect = {
  id: true,
  code: true,
  type: true,
  status: true,
  guest: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  },
} as const;

// Campi essenziali Guest
export const guestSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  customerSegment: true,
} as const;

// Campi essenziali per liste
export const listEntrySelect = {
  id: true,
  firstName: true,
  lastName: true,
  status: true,
  numGuests: true,
  bookingMethod: true,
} as const;

// Opzioni pagination standard
export const getPaginationOptions = (page: number = 1, pageSize: number = 20) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
});

// Cache keys per React Query
export const queryKeys = {
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  tickets: (eventId: string) => ['tickets', eventId] as const,
  guests: ['guests'] as const,
  guest: (id: string) => ['guests', id] as const,
  lists: (eventId: string) => ['lists', eventId] as const,
  analytics: (eventId: string) => ['analytics', eventId] as const,
  user: ['user'] as const,
} as const;
