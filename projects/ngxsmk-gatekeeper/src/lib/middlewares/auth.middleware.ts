import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Configuration options for authentication middleware
 */
export interface AuthMiddlewareOptions {
  /**
   * Path to the authentication status in the context
   * Default: 'user.isAuthenticated'
   * Can be a dot-separated path like 'user.auth.isAuthenticated'
   */
  authPath?: string;
  /**
   * If true, also checks that user object exists
   * Default: true
   */
  requireUser?: boolean;
}

/**
 * Creates an authentication middleware that checks if a user is authenticated
 *
 * @param options - Configuration options for the middleware
 * @returns A middleware function that checks authentication status
 *
 * @example
 * ```typescript
 * const authMiddleware = createAuthMiddleware({
 *   authPath: 'user.isAuthenticated',
 *   requireUser: true
 * });
 * ```
 */
export function createAuthMiddleware(
  options: AuthMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    authPath = 'user.isAuthenticated',
    requireUser = true,
  } = options;

  return createMiddleware('auth', (context: MiddlewareContext) => {
    // Check if user exists if required
    if (requireUser) {
      const user = getValueByPath(context, 'user');
      if (user == null) {
        return false;
      }
    }

    // Get authentication status
    const isAuthenticated = getValueByPath(context, authPath);
    return Boolean(isAuthenticated);
  });
}

