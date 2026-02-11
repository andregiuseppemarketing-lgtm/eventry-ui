import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/lib/auth';
import { UserRole } from '@/lib/validations';
import { z } from 'zod';

/**
 * Standard API response helper
 */
export function createApiResponse<T>(
  data?: T,
  error?: string,
  status: number = 200
) {
  return Response.json(
    {
      ok: !error,
      data: error ? undefined : data,
      error,
    },
    { status }
  );
}

/**
 * Error response helpers
 */
export const ApiErrors = {
  unauthorized: () => createApiResponse(undefined, 'Unauthorized', 401),
  forbidden: () => createApiResponse(undefined, 'Forbidden', 403),
  notFound: (resource?: string) => 
    createApiResponse(undefined, `${resource || 'Resource'} not found`, 404),
  badRequest: (message: string) => createApiResponse(undefined, message, 400),
  internal: (message: string = 'Internal server error') => 
    createApiResponse(undefined, message, 500),
  validation: (errors: z.ZodError) =>
    createApiResponse(
      undefined,
      `Validation error: ${errors.issues.map(i => i.message).join(', ')}`,
      400
    ),
};

/**
 * Auth helper - get current user session
 */
export async function getCurrentUser() {
  const session = await getServerSession(authConfig);
  return (session as any)?.user || null;
}

/**
 * Role-based access control helper
 */
export async function requireAuth(
  requiredRoles?: (keyof typeof UserRole.enum)[],
  req?: NextRequest
) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { error: ApiErrors.unauthorized(), user: null };
  }

  if (requiredRoles && !requiredRoles.includes(user.role as any)) {
    return { error: ApiErrors.forbidden(), user: null };
  }

  return { error: null, user };
}

/**
 * Input validation helper
 */
export function validateInput<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { data?: z.infer<T>; error?: Response } {
  try {
    const result = schema.parse(data);
    return { data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: ApiErrors.validation(error) };
    }
    return { error: ApiErrors.badRequest('Invalid input') };
  }
}

/**
 * Parse request body helper
 */
export async function parseRequestBody(req: NextRequest) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Extract search params helper
 */
export function getSearchParams(req: NextRequest) {
  const url = new URL(req.url);
  return Object.fromEntries(url.searchParams);
}

/**
 * Rate limiting helper (simple in-memory store)
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Audit log helper
 */
export async function createAuditLog(
  userId: string,
  action: string,
  entity: string,
  entityId: string,
  details?: any
) {
  // Import prisma dynamically to avoid circular dependencies
  const { prisma } = await import('@/lib/prisma');
  
  return prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      details,
    },
  });
}

/**
 * Pagination helper
 */
export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
) {
  const pages = Math.ceil(total / limit);
  
  return {
    page,
    limit,
    total,
    pages,
    hasNext: page < pages,
    hasPrev: page > 1,
  };
}