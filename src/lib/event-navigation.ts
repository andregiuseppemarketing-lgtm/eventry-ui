/**
 * Utility per preservare eventId durante la navigazione cross-page
 */

/**
 * Appende eventId come query param all'href se presente
 * 
 * @param href - URL di destinazione
 * @param eventId - ID evento da preservare (null se nessun evento selezionato)
 * @returns href con ?eventId=... se applicabile, altrimenti href originale
 * 
 * @example
 * preserveEventId('/dashboard', 'evt-123') // '/dashboard?eventId=evt-123'
 * preserveEventId('/dashboard', null) // '/dashboard'
 * preserveEventId('/dashboard?foo=bar', 'evt-123') // '/dashboard?foo=bar&eventId=evt-123'
 */
export function preserveEventId(href: string, eventId: string | null): string {
  // Se non c'è eventId, ritorna href originale
  if (!eventId) {
    return href;
  }

  // Ignore route dinamiche con [id] nei params (es. /eventi/[id], /analytics/[eventId])
  // Queste route hanno già l'id nel path e non devono avere eventId in query
  const isDynamicEventRoute = 
    (href.startsWith('/eventi/') && href !== '/eventi/nuovo') ||  // /eventi/[id]/... ma non /eventi/nuovo
    (href.startsWith('/analytics/') && href !== '/analytics/general'); // /analytics/[eventId] ma non /analytics/general
  
  if (isDynamicEventRoute) {
    return href;
  }

  // Parse URL
  const url = new URL(href, 'http://localhost'); // base fittizia solo per parsing
  
  // Se eventId è già presente, non duplicare
  if (url.searchParams.has('eventId')) {
    return href;
  }

  // Aggiungi eventId
  url.searchParams.set('eventId', eventId);
  
  // Ritorna path + query string
  return url.pathname + url.search;
}
