import { z } from 'zod';

// Common response types
export const ApiResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    ok: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

// Pagination
export const PaginationParams = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const PaginatedResponse = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
  });

// User schemas
export const UserRole = z.enum(['ADMIN', 'ORGANIZER', 'DJ', 'PR', 'STAFF', 'USER', 'SECURITY', 'ARTIST']);

export const CreateUserSchema = z.object({
  // Real Identity (required for verification)
  firstName: z.string().min(2, 'Nome troppo corto').max(50, 'Nome troppo lungo'),
  lastName: z.string().min(2, 'Cognome troppo corto').max(50, 'Cognome troppo lungo'),
  middleName: z.string().max(50).optional(),
  
  // Public Identity (social) - UNIQUE constraint
  username: z
    .string()
    .min(3, 'Username troppo corto (minimo 3 caratteri)')
    .max(20, 'Username troppo lungo (massimo 20 caratteri)')
    .regex(/^[a-zA-Z0-9._]+$/, 'Username può contenere solo lettere, numeri, punto (.) e underscore (_)')
    .transform(val => val.toLowerCase()),
  
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password troppo corta (minimo 6 caratteri)').max(100),
  role: UserRole.default('USER'),
  phone: z.string().optional(),
  birthDate: z.string().datetime(),
  ageConsent: z.boolean().refine((val) => val === true, {
    message: 'Devi confermare di avere almeno 18 anni',
  }),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Event schemas
export const EventStatus = z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']);

export const CreateEventSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  coverUrl: z.string().url().optional(),
  dateStart: z.string().datetime(),
  dateEnd: z.string().datetime().optional(),
  status: EventStatus.default('DRAFT'),
  minAge: z.number().int().min(13).max(25).optional(),
  dressCode: z.string().max(100).optional(),
  venueId: z.string().cuid(),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const EventFilters = z.object({
  city: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  status: EventStatus.optional(),
});

// Venue schemas
export const CreateVenueSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  capacity: z.number().int().positive().optional(),
});

// List schemas
export const ListType = z.enum(['PR', 'GUEST', 'STAFF']);
export const Gender = z.enum(['F', 'M', 'NB', 'UNK']);
export const EntryStatus = z.enum(['PENDING', 'CONFIRMED', 'REJECTED']);
export const CreatedVia = z.enum(['MANUAL', 'IMPORT', 'LINK']);

export const CreateListSchema = z.object({
  name: z.string().min(2).max(100),
  type: ListType,
  quotaTotal: z.number().int().positive().optional(),
  quotaFemale: z.number().int().nonnegative().optional(),
  quotaMale: z.number().int().nonnegative().optional(),
});

export const CreateListEntrySchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: Gender.default('UNK'),
  note: z.string().max(500).optional(),
  plusOne: z.boolean().default(false),
});

export const BulkCreateListEntrySchema = z.object({
  entries: z.array(CreateListEntrySchema).min(1).max(100),
});

export const UpdateListEntrySchema = z.object({
  status: EntryStatus.optional(),
  note: z.string().max(500).optional(),
});

// Assignment schemas
export const CreateAssignmentSchema = z.object({
  prProfileId: z.string().cuid(),
  quotaTotal: z.number().int().positive().optional(),
  quotaFemale: z.number().int().nonnegative().optional(),
  quotaMale: z.number().int().nonnegative().optional(),
});

// Ticket schemas
export const TicketType = z.enum(['FREE', 'LIST', 'PAID']);
export const TicketStatus = z.enum(['NEW', 'USED', 'CANCELLED']);

export const IssueTicketSchema = z.object({
  listEntryId: z.string().cuid().optional(),
  userId: z.string().cuid().optional(),
  type: TicketType,
  price: z.number().nonnegative().optional(),
  currency: z.string().length(3).default('EUR'),
});

// Check-in schemas
export const Gate = z.enum(['MAIN', 'VIP', 'STAFF']);

export const CheckInScanSchema = z.object({
  code: z.string().min(1),
  gate: Gate.default('MAIN'),
  notes: z.string().max(200).optional(),
});

// Invite link schemas
export const CreateInviteLinkSchema = z.object({
  eventId: z.string().cuid(),
  prProfileId: z.string().cuid().optional(),
  maxUses: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  utmSource: z.string().max(50).optional(),
  utmMedium: z.string().max(50).optional(),
  utmCampaign: z.string().max(50).optional(),
});

// Stats schemas
export const EventStatsResponse = z.object({
  totalEntries: z.number(),
  totalTickets: z.number(),
  totalCheckins: z.number(),
  conversionRate: z.number(),
  checkinRate: z.number(),
  entriesByPR: z.array(z.object({
    prName: z.string(),
    entries: z.number(),
    tickets: z.number(),
    checkins: z.number(),
  })),
  entriesByGender: z.object({
    F: z.number(),
    M: z.number(),
    NB: z.number(),
    UNK: z.number(),
  }),
  peakTimes: z.array(z.object({
    hour: z.number(),
    checkins: z.number(),
  })),
});

// === ONBOARDING & AUTHENTICATION ===

// Step 1: Email + Password Registration
export const RegisterStepOneSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z
    .string()
    .min(8, 'Password troppo corta (minimo 8 caratteri)')
    .max(100, 'Password troppo lunga')
    .regex(/[A-Z]/, 'Password deve contenere almeno una lettera maiuscola')
    .regex(/[a-z]/, 'Password deve contenere almeno una lettera minuscola')
    .regex(/[0-9]/, 'Password deve contenere almeno un numero'),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'Devi accettare i termini e condizioni',
  }),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: 'Devi accettare la privacy policy',
  }),
});

// Step 2: Profile Information (NO phone - moved to post-login)
export const RegisterStepTwoSchema = z.object({
  firstName: z.string().min(2, 'Nome troppo corto').max(50, 'Nome troppo lungo'),
  lastName: z.string().min(2, 'Cognome troppo corto').max(50, 'Cognome troppo lungo'),
  birthDate: z.string().datetime('Data di nascita non valida'),
  provincia: z.string().length(2, 'Sigla provincia non valida (es. MI, RM)').optional(), // Sigla provincia
  city: z.string().min(2, 'Città troppo corta').max(100).optional(),
  gender: z.enum(['M', 'F', 'NB', 'UNK']).optional(),
  marketingOptIn: z.boolean().default(false),
});

// Step 3: Phone Verification
export const SendOTPSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numero di telefono non valido (formato internazionale richiesto)')
    .transform(val => val.replace(/\s/g, '')), // Rimuove spazi
});

export const VerifyOTPSchema = z.object({
  phoneNumber: z.string(),
  otpCode: z.string().length(6, 'Codice OTP deve essere di 6 cifre').regex(/^\d{6}$/, 'Codice OTP deve contenere solo numeri'),
});

// Update Profile
export const UpdateProfileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  city: z.string().max(100).optional(),
  gender: z.enum(['M', 'F', 'NB', 'UNK']).optional(),
  bio: z.string().max(500).optional(),
  tiktokHandle: z.string().max(30).optional(),
  spotifyUrl: z.string().url().optional(),
  whatsappNumber: z.string().optional(),
  telegramHandle: z.string().max(30).optional(),
});

// Login
export const LoginCredentialsSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(1, 'Password richiesta'),
});

// Export all schemas
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type EventFiltersInput = z.infer<typeof EventFilters>;
export type CreateVenueInput = z.infer<typeof CreateVenueSchema>;
export type CreateListInput = z.infer<typeof CreateListSchema>;
export type CreateListEntryInput = z.infer<typeof CreateListEntrySchema>;
export type BulkCreateListEntryInput = z.infer<typeof BulkCreateListEntrySchema>;
export type UpdateListEntryInput = z.infer<typeof UpdateListEntrySchema>;
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type IssueTicketInput = z.infer<typeof IssueTicketSchema>;
export type CheckInScanInput = z.infer<typeof CheckInScanSchema>;
export type CreateInviteLinkInput = z.infer<typeof CreateInviteLinkSchema>;
export type EventStatsData = z.infer<typeof EventStatsResponse>;
// Onboarding types
export type RegisterStepOneInput = z.infer<typeof RegisterStepOneSchema>;
export type RegisterStepTwoInput = z.infer<typeof RegisterStepTwoSchema>;
export type SendOTPInput = z.infer<typeof SendOTPSchema>;
export type VerifyOTPInput = z.infer<typeof VerifyOTPSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;
export type LoginCredentialsInput = z.infer<typeof LoginCredentialsSchema>;
