import { createMiddleware, getValueByPath, setValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Configuration options for session management middleware
 */
export interface SessionMiddlewareOptions {
  /**
   * Session timeout in seconds
   * Default: 3600 (1 hour)
   */
  timeout?: number;
  /**
   * Extend session on activity
   * Default: true
   */
  extendOnActivity?: boolean;
  /**
   * Path to session data in context
   * Default: 'session'
   */
  sessionPath?: string;
  /**
   * Path to last activity timestamp in session
   * Default: 'lastActivity'
   */
  lastActivityPath?: string;
  /**
   * Path to session expiry timestamp
   * Default: 'expiresAt'
   */
  expiresAtPath?: string;
  /**
   * Redirect URL when session expires
   */
  redirect?: string;
  /**
   * Custom session validation function
   */
  validateSession?: (session: unknown) => boolean;
}



/**
 * Creates middleware that manages session timeout and expiration
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const sessionMiddleware = createSessionMiddleware({
 *   timeout: 3600, // 1 hour
 *   extendOnActivity: true,
 *   redirect: '/login'
 * });
 * ```
 */
export function createSessionMiddleware(
  options: SessionMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    timeout = 3600,
    extendOnActivity = true,
    sessionPath = 'session',
    lastActivityPath = 'lastActivity',
    expiresAtPath = 'expiresAt',
    redirect,
    validateSession = (session) => session !== null && session !== undefined,
  } = options;

  return createMiddleware('session', (context: MiddlewareContext) => {
    const session = getValueByPath(context, sessionPath) as Record<string, unknown> | undefined;

    if (!session || !validateSession(session)) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'No active session',
        };
      }
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiresAt = getValueByPath(session, expiresAtPath) as number | undefined;

    // Check if session has expired
    if (expiresAt && now > expiresAt) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'Session expired',
        };
      }
      return false;
    }

    // Extend session on activity if enabled
    if (extendOnActivity) {
      const newExpiresAt = now + timeout;
      setValueByPath(session, lastActivityPath, now);
      setValueByPath(session, expiresAtPath, newExpiresAt);

      // Update context
      if (context[sessionPath]) {
        (context[sessionPath] as Record<string, unknown>)[lastActivityPath] = now;
        (context[sessionPath] as Record<string, unknown>)[expiresAtPath] = newExpiresAt;
      }
    }

    return true;
  });
}

