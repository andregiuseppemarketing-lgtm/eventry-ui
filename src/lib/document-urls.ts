/**
 * Document URL Helpers
 * Genera URL protetti per documenti di identità
 */

/**
 * Converte URL pubblico in URL API protetto
 * Es: /uploads/identity/doc_front_123.jpg → /api/identity/document/doc_front_123.jpg
 */
export function getProtectedDocumentUrl(publicUrl: string): string {
  if (!publicUrl) return '';
  
  // Extract filename from public URL
  const filename = publicUrl.split('/').pop();
  if (!filename) return publicUrl;
  
  return `/api/identity/document/${filename}`;
}

/**
 * Estrae filename da URL pubblico
 */
export function extractFilename(url: string): string | null {
  if (!url) return null;
  const parts = url.split('/');
  return parts[parts.length - 1] || null;
}

/**
 * Verifica se un URL è un documento di identità
 */
export function isIdentityDocument(url: string): boolean {
  return url.includes('/uploads/identity/');
}
