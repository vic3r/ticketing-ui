/**
 * Input validation/sanitization for forms (OWASP: validate and constrain input).
 * Use before sending to API or storing; never trust client input.
 */

const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 512;
const MAX_NAME_LENGTH = 200;

/** Trim and enforce max length; returns null if invalid */
function sanitizeString(
  value: unknown,
  maxLength: number
): string | null {
  if (value == null || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

/** Basic email format check (OWASP: validate format server-side too) */
function isValidEmailFormat(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= MAX_EMAIL_LENGTH;
}

export const validate = {
  email(value: unknown): string | null {
    const s = sanitizeString(value, MAX_EMAIL_LENGTH);
    if (s === null || !isValidEmailFormat(s)) return null;
    return s;
  },
  password(value: unknown): string | null {
    const s = sanitizeString(value, MAX_PASSWORD_LENGTH);
    return s;
  },
  name(value: unknown): string | null {
    return sanitizeString(value, MAX_NAME_LENGTH);
  },
};

export const LIMITS = {
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_NAME_LENGTH,
} as const;
