import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware per proteggere route API che richiedono autenticazione
 * Verifica JWT e aggiunge user_id alla request
 */
export async function authRequired(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  if (!token || !token.sub) {
    return NextResponse.json(
      { error: 'Unauthorized - Login required' },
      { status: 401 }
    );
  }

  // Il token contiene user.id in token.sub
  // Possiamo accedere agli altri dati del token:
  // - token.role (ruolo utente)
  // - token.email
  // - token.ageVerified
  // - token.identityVerified

  return {
    userId: token.sub,
    role: token.role as string,
    email: token.email as string,
    ageVerified: token.ageVerified as boolean,
    identityVerified: token.identityVerified as boolean,
  };
}

/**
 * Helper per verificare ruolo specifico
 */
export async function requireRole(req: NextRequest, allowedRoles: string[]) {
  const authData = await authRequired(req);
  
  if ('status' in authData) {
    // authData è NextResponse (errore)
    return authData;
  }

  if (!allowedRoles.includes(authData.role)) {
    return NextResponse.json(
      { error: 'Forbidden - Insufficient permissions' },
      { status: 403 }
    );
  }

  return authData;
}

/**
 * Helper per verificare età
 */
export async function requireAgeVerified(req: NextRequest) {
  const authData = await authRequired(req);
  
  if ('status' in authData) {
    return authData;
  }

  if (!authData.ageVerified) {
    return NextResponse.json(
      { error: 'Age verification required' },
      { status: 403 }
    );
  }

  return authData;
}

/**
 * Helper per verificare identità
 */
export async function requireIdentityVerified(req: NextRequest) {
  const authData = await authRequired(req);
  
  if ('status' in authData) {
    return authData;
  }

  if (!authData.identityVerified) {
    return NextResponse.json(
      { error: 'Identity verification required' },
      { status: 403 }
    );
  }

  return authData;
}
