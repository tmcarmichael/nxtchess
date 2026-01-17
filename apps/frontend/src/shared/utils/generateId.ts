/**
 * Generates a unique identifier for sessions and other entities.
 * Uses crypto.randomUUID when available, falls back to custom implementation.
 */

/**
 * Generate a UUID v4 compatible string
 */
export const generateSessionId = (): string => {
  // Use native crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Generate a short ID for less critical use cases
 * Format: 8 characters alphanumeric
 */
export const generateShortId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate a prefixed ID for specific entity types
 */
export const generatePrefixedId = (prefix: string): string => {
  return `${prefix}_${generateSessionId()}`;
};
