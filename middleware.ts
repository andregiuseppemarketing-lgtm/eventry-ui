import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { 
  isPublicRoute, 
  isAuthRoute, 
  isOnboardingRoute,
  DEFAULT_LOGGED_IN_REDIRECT 
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
 * 
 * TODO FUTURE PHASES:
 * - Phase 2: Add identity verification checks (client-side)
 * - Phase 3: Add age verification for specific routes (client-side)
 * - Phase 5: Add role-based access control (client-side with API validation)
 */
export default withAuth(
  async function middleware(req) {
    try {
      const response = NextResponse.next();
      
      // Security headers
      response.headers.set('X-DNS-Prefetch-Control', 'on');
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'SAMEORIGIN');
      response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
      
      const { pathname } = req.nextUrl;
      
      // --- STEP 1: PUBLIC ROUTES ---
      // Allow unrestricted access to public routes
      if (isPublicRoute(pathname)) {
        return response;
      }
      
      // --- STEP 2: AUTH ROUTES (login/register) ---
      // Allow access - client-side will handle redirects for logged-in users
      if (isAuthRoute(pathname)) {
        return response;
      }
      
      // --- STEP 3: ONBOARDING ROUTES ---
      // Allow access if authenticated - client-side handles step validation
      if (isOnboardingRoute(pathname)) {
        return response;
      }
      
      // --- STEP 4: PROTECTED ROUTES ---
      // Authentication check handled by withAuth authorized callback
      // Onboarding completion checked client-side in page components
      
      // --- MILESTONE 7: ROLE-BASED ACCESS ---
      const token = req.nextauth?.token;
      const role = token?.role as string | undefined;
      
      // Proteggi dashboard analytics (solo ADMIN)
      if (pathname.startsWith("/dashboard/analytics") && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      
      // Proteggi API analytics (solo ADMIN)
      if (pathname.startsWith("/api/dashboard/stats/update") && role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      
      return response;
      
    } catch (error) {
      // FAIL-SAFE: Log error but allow request to proceed
      console.error('[Middleware] Critical error:', {
        pathname: req.nextUrl.pathname,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      return NextResponse.next();
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Public routes are always authorized
        if (isPublicRoute(pathname)) {
          return true;
        }
        
        // Auth routes are always accessible (middleware handles logged-in redirect)
        if (isAuthRoute(pathname)) {
          return true;
        }
        
        // Onboarding routes require authentication
        if (isOnboardingRoute(pathname)) {
          return !!token;
        }
        
        // All other routes require authentication
        return !!token;
      },
    },
    pages: {
      signIn: '/auth/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.*|manifest.*|auth).*)',
  ],
};
