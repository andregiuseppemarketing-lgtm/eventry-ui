/**
 * Page-based Permission System (Fase 1A)
 * 
 * Logica minima di permessi per il nuovo modello Page-based.
 * Fase 1A = owner-only (no collaborators, no ruoli complessi)
 * 
 * SCOPE MINIMO:
 * - Verifica ownership Page
 * - Verifica permessi creazione/modifica eventi Page-based
 * - Mantiene backward compatibility con eventi user-based
 */

import { prisma } from '@/lib/prisma';
import { PageType } from '@prisma/client';

/**
 * Tipi di Page che possono creare eventi
 * Fase 1A: VENUE, ORGANIZATION, FESTIVAL
 * (PR e ARTIST esclusi per ora)
 */
const EVENT_CREATOR_PAGE_TYPES: PageType[] = [
  'VENUE',
  'ORGANIZATION',
  'FESTIVAL',
];

/**
 * Risultato operazione permesso
 */
export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Risultato operazione permesso evento con context aggiuntivo
 */
export interface EventPermissionResult extends PermissionResult {
  isPageOwner?: boolean;
  isDirectCreator?: boolean;
  isAdmin?: boolean;
}

/**
 * Verifica se un utente può creare eventi come una specifica Page
 * 
 * CONDIZIONI (tutte devono essere vere):
 * 1. La Page deve esistere
 * 2. La Page deve essere di tipo VENUE, ORGANIZATION o FESTIVAL
 * 3. L'utente deve essere owner della Page (ownerId === userId)
 * 
 * @param userId - ID utente richiedente
 * @param pageId - ID della Page da verificare
 * @returns PermissionResult con allowed e eventuale reason
 * 
 * @example
 * const result = await canCreateEventAsPage(userId, pageId);
 * if (!result.allowed) {
 *   return res.status(403).json({ error: result.reason });
 * }
 */
export async function canCreateEventAsPage(
  userId: string,
  pageId: string
): Promise<PermissionResult> {
  try {
    // 1. Verifica che la Page esista
    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: {
        id: true,
        type: true,
        ownerId: true,
        name: true,
      },
    });

    if (!page) {
      return {
        allowed: false,
        reason: 'Page non trovata',
      };
    }

    // 2. Verifica che il tipo Page possa creare eventi
    if (!EVENT_CREATOR_PAGE_TYPES.includes(page.type)) {
      return {
        allowed: false,
        reason: `Il tipo di Page "${page.type}" non può creare eventi. Tipi permessi: VENUE, ORGANIZATION, FESTIVAL`,
      };
    }

    // 3. Verifica ownership
    if (page.ownerId !== userId) {
      return {
        allowed: false,
        reason: 'Solo il proprietario della Page può creare eventi',
      };
    }

    // ✅ Tutte le condizioni soddisfatte
    return {
      allowed: true,
    };
  } catch (error) {
    console.error('[canCreateEventAsPage] Error:', error);
    return {
      allowed: false,
      reason: 'Errore di sistema durante la verifica dei permessi',
    };
  }
}

/**
 * Verifica se un utente può modificare un evento
 * 
 * SUPPORTA DUE MODELLI:
 * - Eventi legacy user-based: createdByUserId === userId
 * - Eventi page-based: createdByPageId && page.ownerId === userId
 * 
 * REGOLE:
 * 1. ADMIN può sempre modificare
 * 2. Se evento è user-based: createdByUserId === userId
 * 3. Se evento è page-based: createdByPageId && page.ownerId === userId
 * 4. Altrimenti: negato
 * 
 * @param userId - ID utente richiedente
 * @param eventId - ID evento da modificare
 * @param userRole - Ruolo utente (opzionale, per check ADMIN)
 * @returns EventPermissionResult con context dettagliato
 * 
 * @example
 * const result = await canEditEvent(userId, eventId, userRole);
 * if (!result.allowed) {
 *   return res.status(403).json({ error: result.reason });
 * }
 * if (result.isPageOwner) {
 *   // Logica specifica per Page owner
 * }
 */
export async function canEditEvent(
  userId: string,
  eventId: string,
  userRole?: string
): Promise<EventPermissionResult> {
  try {
    // 1. Verifica evento esista
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        createdByUserId: true,
        createdByPageId: true,
        createdByPage: {
          select: {
            id: true,
            ownerId: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!event) {
      return {
        allowed: false,
        reason: 'Evento non trovato',
      };
    }

    // 2. Check ADMIN (bypass tutti i controlli)
    if (userRole === 'ADMIN') {
      return {
        allowed: true,
        isAdmin: true,
      };
    }

    // 3. Check evento user-based (legacy)
    if (event.createdByUserId === userId) {
      return {
        allowed: true,
        isDirectCreator: true,
      };
    }

    // 4. Check evento page-based (nuovo modello)
    if (event.createdByPageId && event.createdByPage) {
      if (event.createdByPage.ownerId === userId) {
        return {
          allowed: true,
          isPageOwner: true,
        };
      } else {
        return {
          allowed: false,
          reason: 'Solo il proprietario della Page può modificare questo evento',
        };
      }
    }

    // 5. Nessuna condizione soddisfatta
    return {
      allowed: false,
      reason: 'Non hai i permessi per modificare questo evento',
    };
  } catch (error) {
    console.error('[canEditEvent] Error:', error);
    return {
      allowed: false,
      reason: 'Errore di sistema durante la verifica dei permessi',
    };
  }
}

/**
 * Helper: Ottiene tutte le Page di un utente che possono creare eventi
 * 
 * Utile per popolare dropdown "Crea evento come..." in UI Step 4
 * 
 * @param userId - ID utente
 * @returns Array di Page (VENUE, ORGANIZATION, FESTIVAL) owned dall'utente
 */
export async function getUserEventCreatorPages(userId: string) {
  return await prisma.page.findMany({
    where: {
      ownerId: userId,
      type: {
        in: EVENT_CREATOR_PAGE_TYPES,
      },
    },
    select: {
      id: true,
      type: true,
      name: true,
      slug: true,
    },
    orderBy: {
      name: 'asc',
    },
  });
}
