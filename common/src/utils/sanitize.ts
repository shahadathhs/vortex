/**
 * Sanitize objects for API response - strip MongoDB/ Mongoose internal fields.
 * Use for .lean() results where schema toJSON does not apply.
 */

const SENSITIVE_KEYS = [
  '__v',
  'password',
  'refreshToken',
  'passwordResetToken',
  'passwordResetExpires',
];

function sanitizeValue<T>(value: T): T {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item: unknown) => sanitizeValue(item)) as T;
  }
  if (typeof value === 'object' && value.constructor === Object) {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (SENSITIVE_KEYS.includes(k)) continue;
      out[k] = sanitizeValue(v);
    }
    return out as T;
  }
  return value;
}

/**
 * Strip __v, password, and other sensitive fields from an object or array.
 * Safe to use on .lean() results.
 */
export function sanitizeForResponse<T>(data: T): T {
  return sanitizeValue(data);
}
