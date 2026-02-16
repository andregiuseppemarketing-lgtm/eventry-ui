import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { 
  isPublicRoute, 
  isAuthRoute, 
  isOnboardingRoute,
} from '@/lib/route-config';

/**
 * Middleware for authentication and route protection
 * 
 * NOTE: Onboarding checks are handled CLIENT-SIDE because middleware runs on Edge Runtime
 * and CANNOT use Prisma Client. See individual page components for onboarding logic.
 * 
 * Flow:
 * 1. Public routes → always accessible
 * 2. Auth routes → accessible to all
 * 3. Onboarding routes → require authentication only
 * 4. Protected routes → require authentication (onboarding checked client-side)
 */
export async function middleware(req: NextRequest) {
  try {
    const { pathname } = req.nextUrl;
    
    // --- STEP 1: PUBLIC ROUTES ---
    // Allow unrestricted access to public routes
    if (isPublicRoute(pathname)) {
      return NextResponse.next();
    }
    
    // --- STEP 2: AUTH ROUTES (login/register) ---
    // Allow access - client-side will handle redirects for logged-in users
    if (isAuthRoute(pathname)) {
      return NextResponse.next();
    }
    
    // --- STEP 3: CHECK AUTHENTICATION ---
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET || 'KW075njmAZlbgqWF7uvf26GOHVSbm4RKU2C+zGE3byY='
    });
    
    // --- STEP 4: ONBOARDING ROUTES ---
    if (isOnboardingRoute(pathname)) {
      if (!token) {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
      return NextResponse.next();
    }
    
    // --- STEP 5: PROTECTED ROUTES ---
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    
    // --- MILESTONE 7: ROLE-BASED ACCESS ---
    const role = token?.role as string | undefined;
    
    // Proteggi dashboard analytics (solo ADMIN)
    if (pathname.startsWith("/dashboard/analytics") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
    
    // Proteggi API analytics (solo ADMIN)
    if (pathname.startsWith("/api/dashboard/stats/update") && role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    return NextResponse.next();
    
  } catch (error) {
    // FAIL-SAFE: Log error but allow request to proceed
    console.error('[Middleware] Critical error:', {
      pathname: req.nextUrl.pathname,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - /api/* (API routes)
     * - /auth/* (NextAuth pages)
     * - /_next/* (Next.js internals)
     * - Static files (favicon, icons, manifest)
     */
    '/((?!api/|auth/|_next/|favicon\\.ico|icon-|manifest-).*)',
  ],
};
