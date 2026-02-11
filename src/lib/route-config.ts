/**
 * Centralized route configuration for middleware
 * Defines which routes are public, require auth, require onboarding, etc.
 */

/**
 * Default redirect paths for authenticated and unauthenticated users
 */
export const DEFAULT_LOGGED_IN_REDIRECT = '/user/profilo';
export const DEFAULT_LOGGED_OUT_REDIRECT = '/auth/login';
export const DEFAULT_ERROR_REDIRECT = '/';

/**
 * Public routes that don't require authentication
 * These routes are accessible to everyone (logged in or not)
 * Note: Auth routes (/auth/*) are handled separately in AUTH_ROUTES
 */
export const PUBLIC_ROUTES = [
  '/',
  '/privacy-policy',
  '/cookie-policy',
  '/gdpr',
  '/eventi', // Browse events (public)
] as const;

/**
 * Auth-related routes (login, register, error pages)
 * Used to redirect authenticated users away from these pages
 */
export const AUTH_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/error',
  '/auth/forgot-password',
  '/auth/reset-password',
] as const;

/**
 * Onboarding routes
 * Users with incomplete onboarding should only access these + auth routes
 */
export const ONBOARDING_ROUTES = [
  '/onboarding/step-2',
  '/onboarding/step-3', // Optional phone verification (not blocking)
] as const;

/**
 * Routes that require authentication AND completed onboarding
 */
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/user/profilo',
  '/user/settings',
  '/biglietti',
  '/checkin',
] as const;

/**
 * Role-based route configuration (for future use)
 * TODO: Implement in Sprint 2+
 */
export const ROLE_BASED_ROUTES = {
  '/lista': { requireRole: ['PR', 'ORGANIZER', 'ADMIN'] },
  '/venues': { requireRole: ['ORGANIZER', 'ADMIN'], minAge: 21, requireIdentity: true },
  '/org': { requireRole: ['ORGANIZER', 'ADMIN'] },
  '/dj': { requireRole: ['ARTIST', 'ADMIN'] },
} as const;

/**
 * Check if a pathname is a public route
 * 
 * @param pathname - The URL pathname to check
 * @returns true if route is public
 */
export function isPublicRoute(pathname: string): boolean {
  // Exact match in public routes list
  if (PUBLIC_ROUTES.includes(pathname as any)) {
    return true;
  }

  // Club profile pages are public: /clubs/[id]
  if (/^\/clubs\/[^/]+$/.test(pathname)) {
    return true;
  }

  // Event detail pages are public: /eventi/[id]
  if (/^\/eventi\/[^/]+$/.test(pathname)) {
    return true;
  }

  // Venue profile pages are public: /venue/[id]
  if (/^\/venue\/[^/]+$/.test(pathname)) {
    return true;
  }

  // Organization profile pages are public: /org/[slug]
  // (But /org/dashboard is protected)
  if (/^\/org\/[^/]+$/.test(pathname) && !pathname.includes('/dashboard')) {
    return true;
  }

  return false;
}

/**
 * Check if a pathname is an auth route (login, register, etc.)
 * 
 * @param pathname - The URL pathname to check
 * @returns true if route is an auth page
 */
export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.includes(pathname as any);
}

/**
 * Check if a pathname is an onboarding route
 * 
 * @param pathname - The URL pathname to check
 * @returns true if route is an onboarding page
 */
export function isOnboardingRoute(pathname: string): boolean {
  return pathname.startsWith('/onboarding/');
}

/**
 * Check if a pathname requires completed onboarding
 * 
 * @param pathname - The URL pathname to check
 * @returns true if route requires completed onboarding
 */
export function requiresOnboarding(pathname: string): boolean {
  // Public routes don't require onboarding
  if (isPublicRoute(pathname)) {
    return false;
  }

  // Auth routes don't require onboarding
  if (isAuthRoute(pathname)) {
    return false;
  }

  // Onboarding routes themselves don't require completed onboarding
  if (isOnboardingRoute(pathname)) {
    return false;
  }

  // All other routes require completed onboarding
  return true;
}

/**
 * Safely validate and return a redirect path
 * Prevents open redirect vulnerabilities by validating target paths
 * 
 * @param targetPath - The desired redirect path
 * @param fallbackPath - Fallback path if targetPath is invalid
 * @returns Safe redirect path (always a valid relative path)
 * 
 * @example
 * ```typescript
 * const safePath = getSafeRedirect('/user/profilo', '/dashboard');
 * router.push(safePath);
 * ```
 */
export function getSafeRedirect(
  targetPath: string | null | undefined,
  fallbackPath: string = DEFAULT_LOGGED_IN_REDIRECT
): string {
  // Case 1: Empty or invalid input
  if (!targetPath || typeof targetPath !== 'string' || targetPath.trim() === '') {
    return fallbackPath;
  }

  const trimmed = targetPath.trim();

  // Case 2: Prevent absolute URLs (open redirect attack)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('//')) {
    console.warn('[getSafeRedirect] Blocked absolute URL redirect:', trimmed);
    return fallbackPath;
  }

  // Case 3: Ensure path starts with /
  if (!trimmed.startsWith('/')) {
    console.warn('[getSafeRedirect] Invalid path (must start with /):', trimmed);
    return fallbackPath;
  }

  // Case 4: Block suspicious patterns
  if (trimmed.includes('..') || trimmed.includes('\\')) {
    console.warn('[getSafeRedirect] Blocked suspicious path:', trimmed);
    return fallbackPath;
  }

  // Case 5: Valid relative path
  return trimmed;
}

/**
 * Check if a pathname requires specific role (for future use)
 * TODO: Implement role checks in Sprint 2+
 * 
 * @param pathname - The URL pathname to check
 * @returns Role requirements or null if no specific role required
 */
export function getRouteRoleRequirements(pathname: string): {
  requireRole?: readonly string[];
  minAge?: number;
  requireIdentity?: boolean;
} | null {
  // Find matching route pattern
  for (const [pattern, requirements] of Object.entries(ROLE_BASED_ROUTES)) {
    if (pathname.startsWith(pattern)) {
      return requirements;
    }
  }

  return null;
}
