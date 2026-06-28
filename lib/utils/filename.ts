const MAX_BASENAME_LENGTH = 80;

/**
 * Sanitizes a search term for use in artifact filenames.
 * Lowercase, spaces → hyphens, strips unsafe characters.
 */
export function sanitizeSearchTermForFilename(searchTerm: string): string {
  const normalized = searchTerm
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) {
    return "search";
  }

  return normalized.slice(0, MAX_BASENAME_LENGTH);
}

/** Builds `{searchTerm}-{YYYY-MM-DD}.xlsx` using a sanitized basename. */
export function buildExcelFilename(
  searchTerm: string,
  generatedAt: Date = new Date(),
): string {
  const basename = sanitizeSearchTermForFilename(searchTerm);
  const datePart = generatedAt.toISOString().slice(0, 10);
  return `${basename}-${datePart}.xlsx`;
}

/** Builds `{searchTerm}-{YYYY-MM-DD}.pptx` using a sanitized basename. */
export function buildPptFilename(
  searchTerm: string,
  generatedAt: Date = new Date(),
): string {
  const basename = sanitizeSearchTermForFilename(searchTerm);
  const datePart = generatedAt.toISOString().slice(0, 10);
  return `${basename}-${datePart}.pptx`;
}
