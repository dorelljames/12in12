/**
 * Generates a URL-friendly slug from a string
 * @param text The text to convert to a slug
 * @returns A URL-friendly slug
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase() // Convert to lowercase
    .trim() // Remove leading/trailing spaces
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-"); // Remove consecutive hyphens
}

/**
 * Generates a unique slug by appending a random string if needed
 * @param baseSlug The initial slug to make unique
 * @param existingSlugs Array of existing slugs to check against
 * @returns A unique slug
 */
export function makeSlugUnique(
  baseSlug: string,
  existingSlugs: string[]
): string {
  let slug = baseSlug;
  let counter = 1;

  // Keep checking and incrementing until we find a unique slug
  while (existingSlugs.includes(slug)) {
    // For the first iteration, just append -1
    // For subsequent iterations, replace the previous number
    slug = baseSlug + "-" + counter;
    counter++;
  }

  return slug;
}
