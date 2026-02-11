/**
 * Age Verification & Identity Helpers
 * GDPR-compliant age verification system
 */

export interface AgeVerificationResult {
  allowed: boolean;
  reason?: string;
  age?: number;
}

/**
 * Calcola età da data di nascita
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Valida data di nascita
 */
export function isValidBirthDate(birthDate: Date): { valid: boolean; reason?: string } {
  const now = new Date();
  const age = calculateAge(birthDate);
  
  // Check se data è nel futuro
  if (birthDate > now) {
    return { valid: false, reason: 'La data di nascita non può essere nel futuro' };
  }
  
  // Check se età è ragionevole (< 120 anni)
  if (age > 120) {
    return { valid: false, reason: 'Data di nascita non valida' };
  }
  
  return { valid: true };
}

/**
 * Verifica se utente ha almeno 18 anni
 */
export function isLegalAge(birthDate: Date, minimumAge: number = 18): boolean {
  const age = calculateAge(birthDate);
  return age >= minimumAge;
}

/**
 * Check se utente può registrarsi (>= 18 anni)
 */
export function canRegister(birthDate: Date): AgeVerificationResult {
  const validation = isValidBirthDate(birthDate);
  if (!validation.valid) {
    return { allowed: false, reason: validation.reason };
  }
  
  const age = calculateAge(birthDate);
  
  if (age < 18) {
    return { 
      allowed: false, 
      reason: 'Devi avere almeno 18 anni per registrarti',
      age 
    };
  }
  
  return { allowed: true, age };
}

/**
 * Check se utente può iscriversi a lista evento
 * Richiede verifica identità + età minima evento
 */
export function canJoinEventList(user: {
  identityVerified: boolean;
  birthDate: Date | null;
  age: number | null;
}, event: {
  ageRestrictionEnabled: boolean;
  ageRestrictionMin: number | null;
  ageRestrictionMax: number | null;
}): AgeVerificationResult {
  
  // Verifica identità obbligatoria per liste
  if (!user.identityVerified) {
    return { 
      allowed: false, 
      reason: 'Devi verificare la tua identità per iscriverti a liste eventi' 
    };
  }
  
  const userAge = user.age || (user.birthDate ? calculateAge(user.birthDate) : null);
  
  if (!userAge) {
    return { 
      allowed: false, 
      reason: 'Data di nascita mancante' 
    };
  }
  
  // Check restrizioni età evento
  if (event.ageRestrictionEnabled && event.ageRestrictionMin) {
    if (userAge < event.ageRestrictionMin) {
      return { 
        allowed: false, 
        reason: `Questo evento è riservato a persone di ${event.ageRestrictionMin}+ anni`,
        age: userAge
      };
    }
    
    // Check età massima (se presente)
    if (event.ageRestrictionMax && userAge > event.ageRestrictionMax) {
      return { 
        allowed: false, 
        reason: `Questo evento è riservato a persone tra ${event.ageRestrictionMin} e ${event.ageRestrictionMax} anni`,
        age: userAge
      };
    }
  }
  
  return { allowed: true, age: userAge };
}

/**
 * Check se utente può acquistare ticket
 * Richiede verifica identità obbligatoria
 */
export function canPurchaseTicket(user: {
  identityVerified: boolean;
  birthDate: Date | null;
  age: number | null;
}): AgeVerificationResult {
  
  if (!user.identityVerified) {
    return { 
      allowed: false, 
      reason: 'Devi verificare la tua identità per acquistare biglietti' 
    };
  }
  
  const age = user.age || (user.birthDate ? calculateAge(user.birthDate) : null);
  
  if (!age || age < 18) {
    return { 
      allowed: false, 
      reason: 'Devi avere almeno 18 anni per acquistare biglietti',
      age: age || undefined
    };
  }
  
  return { allowed: true, age };
}

/**
 * Check se utente può diventare PR
 * Richiede: età >= 18 + identità verificata
 */
export function canBecomePR(user: {
  identityVerified: boolean;
  birthDate: Date | null;
  age: number | null;
}): AgeVerificationResult {
  
  if (!user.identityVerified) {
    return { 
      allowed: false, 
      reason: 'Devi verificare la tua identità per diventare PR' 
    };
  }
  
  const age = user.age || (user.birthDate ? calculateAge(user.birthDate) : null);
  
  if (!age || age < 18) {
    return { 
      allowed: false, 
      reason: 'Devi avere almeno 18 anni per diventare PR',
      age: age || undefined
    };
  }
  
  return { allowed: true, age };
}

/**
 * Check se utente può creare un locale
 * Richiede: età >= 21 + identità verificata
 */
export function canCreateVenue(user: {
  identityVerified: boolean;
  birthDate: Date | null;
  age: number | null;
}): AgeVerificationResult {
  
  if (!user.identityVerified) {
    return { 
      allowed: false, 
      reason: 'Devi verificare la tua identità per creare un locale' 
    };
  }
  
  const age = user.age || (user.birthDate ? calculateAge(user.birthDate) : null);
  
  if (!age || age < 21) {
    return { 
      allowed: false, 
      reason: 'Devi avere almeno 21 anni per creare un locale',
      age: age || undefined
    };
  }
  
  return { allowed: true, age };
}

/**
 * Check se utente può creare un'organizzazione
 * Richiede: età >= 18 + identità verificata
 */
export function canCreateOrganization(user: {
  identityVerified: boolean;
  birthDate: Date | null;
  age: number | null;
}): AgeVerificationResult {
  
  if (!user.identityVerified) {
    return { 
      allowed: false, 
      reason: 'Devi verificare la tua identità per creare un\'organizzazione' 
    };
  }
  
  const age = user.age || (user.birthDate ? calculateAge(user.birthDate) : null);
  
  if (!age || age < 18) {
    return { 
      allowed: false, 
      reason: 'Devi avere almeno 18 anni per creare un\'organizzazione',
      age: age || undefined
    };
  }
  
  return { allowed: true, age };
}

/**
 * Check se utente può diventare artista
 * Identità verificata consigliata ma non obbligatoria
 */
export function canBecomeArtist(user: {
  identityVerified: boolean;
  birthDate: Date | null;
  age: number | null;
}): AgeVerificationResult {
  
  const age = user.age || (user.birthDate ? calculateAge(user.birthDate) : null);
  
  if (!age || age < 18) {
    return { 
      allowed: false, 
      reason: 'Devi avere almeno 18 anni per diventare artista',
      age: age || undefined
    };
  }
  
  return { allowed: true, age };
}

/**
 * Utility per organizzatori: ottieni età ospite
 * Solo organizzatori/staff evento possono vedere età
 */
export function getGuestAgeForOrganizer(
  guest: {
    age: number | null;
    birthDate: Date | null;
    ageVisibleToOrganizers: boolean;
  },
  requester: {
    id: string;
  },
  event: {
    creatorId: string;
    // collaborators in future
  }
): number | null {
  
  // Check privacy settings
  if (!guest.ageVisibleToOrganizers) {
    return null;
  }
  
  // Check se requester è autorizzato
  const isAuthorized = event.creatorId === requester.id;
  // TODO: check anche collaborators quando implementiamo FASE 5
  
  if (!isAuthorized) {
    return null;
  }
  
  return guest.age || (guest.birthDate ? calculateAge(guest.birthDate) : null);
}

/**
 * Format età per display (es. "23 anni")
 */
export function formatAge(age: number): string {
  return `${age} ${age === 1 ? 'anno' : 'anni'}`;
}

/**
 * Get age range label per evento
 */
export function getAgeRangeLabel(min: number | null, max: number | null): string | null {
  if (!min) return null;
  
  if (max) {
    return `${min}-${max} anni`;
  }
  
  return `${min}+`;
}
