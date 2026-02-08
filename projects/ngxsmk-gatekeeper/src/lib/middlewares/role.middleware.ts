import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Configuration options for role middleware
 */
export interface RoleMiddlewareOptions {
  /**
   * Required roles - user must have at least one (OR) or all (AND) depending on mode
   */
  roles: string | string[];
  /**
   * Path to the roles array in the context
   * Default: 'user.roles'
   */
  rolesPath?: string;
  /**
   * If 'any', user must have at least one of the required roles (OR)
   * If 'all', user must have all required roles (AND)
   * Default: 'any'
   */
  mode?: 'any' | 'all';
  /**
   * If true, also checks that user object exists
   * Default: true
   */
  requireUser?: boolean;
}

/**
 * Creates a role-based middleware that checks if a user has required roles
 *
 * @param options - Configuration options for the middleware
 * @returns A middleware function that checks role permissions
 *
 * @example
 * ```typescript
 * // User must have 'admin' OR 'moderator' role
 * const adminMiddleware = createRoleMiddleware({
 *   roles: ['admin', 'moderator'],
 *   mode: 'any'
 * });
 *
 * // User must have both 'admin' AND 'super' roles
 * const superAdminMiddleware = createRoleMiddleware({
 *   roles: ['admin', 'super'],
 *   mode: 'all'
 * });
 * ```
 */
export function createRoleMiddleware(
  options: RoleMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    roles,
    rolesPath = 'user.roles',
    mode = 'any',
    requireUser = true,
  } = options;

  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return createMiddleware('role', (context: MiddlewareContext) => {
    // Check if user exists if required
    if (requireUser) {
      const user = getValueByPath(context, 'user');
      if (user == null) {
        return false;
      }
    }

    // Get user roles
    const userRoles = getValueByPath(context, rolesPath);
    if (!Array.isArray(userRoles)) {
      return false;
    }

    // Check roles based on mode
    if (mode === 'all') {
      // User must have ALL required roles
      return requiredRoles.every((role) => userRoles.includes(role));
    } else {
      // User must have at least ONE required role
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  });
}

