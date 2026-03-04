/**
 * Search utilities for building MongoDB $or queries with sanitized regex.
 */

/**
 * Escapes special regex characters to prevent injection and unintended behavior.
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Builds a MongoDB $or query for case-insensitive search across multiple string fields.
 * Returns null if term is empty/whitespace.
 */
export function buildSearchOr(
  fields: string[],
  term: string,
): Record<string, unknown> | null {
  const trimmed = term?.trim();
  if (!trimmed) return null;

  const escaped = escapeRegex(trimmed);
  const regex = new RegExp(escaped, 'i');

  if (fields.length === 0) return null;
  if (fields.length === 1) {
    return { [fields[0]]: regex };
  }

  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
}
