/**
 * Slug generation and validation utilities
 */

/**
 * Generate a URL-friendly slug from a string
 * Examples:
 * - "Mario Rossi" -> "mario-rossi"
 * - "Discoteca Milano 2024" -> "discoteca-milano-2024"
 * - "Panico Events!" -> "panico-events"
 */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // Replace spaces and underscores with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove special characters except hyphens
    .replace(/[^\w\-]+/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/\-\-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate slug format
 * Rules:
 * - Only lowercase letters, numbers, hyphens
 * - 3-50 characters
 * - Cannot start/end with hyphen
 * - No consecutive hyphens
 */
export function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 50;
}

/**
 * Generate unique slug by appending number if needed
 * Example: "mario-rossi" -> "mario-rossi-2" if original exists
 */
export function generateUniqueSlug(baseSlug: string, existingSlugs: string[]): string {
  let slug = baseSlug;
  let counter = 2;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

/**
 * Sanitize user input for slug
 */
export function sanitizeSlugInput(input: string): string {
  const generated = generateSlug(input);
  
  // Ensure minimum length
  if (generated.length < 3) {
    throw new Error('Lo slug deve essere di almeno 3 caratteri');
  }
  
  // Ensure maximum length
  if (generated.length > 50) {
    return generated.substring(0, 50).replace(/-+$/, '');
  }
  
  return generated;
}
