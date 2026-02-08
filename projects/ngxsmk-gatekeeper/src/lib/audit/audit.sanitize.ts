import { getValueByPath, DEFAULT_SENSITIVE_FIELDS } from '../helpers';

/**
 * PII sanitization utilities for audit logging
 */

/**
 * Sanitizes an object by removing PII fields
 * 
 * @param obj - Object to sanitize
 * @param excludeFields - Additional fields to exclude (merged with default PII fields)
 * @returns Sanitized object with PII fields removed
 */
export function sanitizeObject(
  obj: unknown,
  excludeFields: string[] = []
): Record<string, unknown> {
  if (obj == null || typeof obj !== 'object') {
    return {};
  }

  const allExcludeFields = [...DEFAULT_SENSITIVE_FIELDS, ...excludeFields].map(f => f.toLowerCase());
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const keyLower = key.toLowerCase();

    // Skip PII fields
    if (allExcludeFields.some(field => keyLower.includes(field))) {
      continue;
    }

    // Recursively sanitize nested objects
    if (value != null && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value, excludeFields);
    } else if (Array.isArray(value)) {
      // Sanitize array items
      sanitized[key] = value.map(item =>
        typeof item === 'object' && item !== null
          ? sanitizeObject(item, excludeFields)
          : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Extracts a safe user identifier from context
 * 
 * Attempts to find a non-PII identifier like user ID or session ID.
 * Returns undefined if no safe identifier is found.
 * 
 * @param context - Middleware context
 * @param userIdPaths - Paths to check for user identifier
 * @returns Safe user identifier or undefined
 */
export function extractUserId(
  context: Record<string, unknown>,
  userIdPaths: string[] = ['user.id', 'user.sessionId', 'user.userId', 'session.id']
): string | undefined {
  for (const path of userIdPaths) {
    const value = getValueByPath(context, path);
    if (value != null && typeof value === 'string') {
      return value;
    }
    if (value != null && typeof value === 'number') {
      return String(value);
    }
  }

  return undefined;
}



