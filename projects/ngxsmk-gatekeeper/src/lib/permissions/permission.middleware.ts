import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext, MiddlewareResponse } from '../core';
import { hasPermission, hasAllPermissions } from './permission.utils';
import { resolveRoles, RoleHierarchy } from './role-hierarchy';

/**
 * Configuration options for permission middleware
 */
export interface PermissionMiddlewareOptions {
  /**
   * Required permissions in "resource.action" format
   * Examples: ['invoice.read', 'user.write', 'invoice.*']
   * Supports wildcards: 'resource.*' or '*.action'
   */
  permissions: string | string[];
  /**
   * Path to the user's permissions array in the context
   * Default: 'user.permissions'
   */
  permissionsPath?: string;
  /**
   * Path to the user's roles array in the context (for role-based permissions)
   * Default: 'user.roles'
   */
  rolesPath?: string;
  /**
   * Role-to-permissions mapping
   * Maps roles to arrays of permissions they grant
   * 
   * @example
   * ```typescript
   * rolePermissions: {
   *   'admin': ['*.*'], // Admin has all permissions
   *   'manager': ['invoice.*', 'user.read'],
   *   'user': ['invoice.read'],
   * }
   * ```
   */
  rolePermissions?: Record<string, string[]>;
  /**
   * Role hierarchy configuration
   * Defines parent-child relationships between roles
   * Child roles inherit permissions from parent roles
   */
  roleHierarchy?: RoleHierarchy;
  /**
   * If 'any', user must have at least one of the required permissions (OR)
   * If 'all', user must have all required permissions (AND)
   * Default: 'any'
   */
  mode?: 'any' | 'all';
  /**
   * If true, also checks that user object exists
   * Default: true
   */
  requireUser?: boolean;
  /**
   * Optional redirect path when permission check fails
   */
  redirect?: string;
}

/**
 * Creates a permission-based middleware that checks if a user has required permissions
 * 
 * Supports:
 * - Direct permissions: ['invoice.read', 'user.write']
 * - Wildcard permissions: ['invoice.*', '*.read']
 * - Role-based permissions: Maps roles to permissions
 * - Hierarchical roles: Roles inherit permissions from parent roles
 * 
 * @param options - Configuration options for the permission middleware
 * @returns A middleware function that checks permissions
 * 
 * @example
 * ```typescript
 * // Simple permission check
 * const invoiceReadMiddleware = permissionMiddleware(['invoice.read']);
 * 
 * // Multiple permissions (any)
 * const invoiceMiddleware = permissionMiddleware(['invoice.read', 'invoice.write']);
 * 
 * // All permissions required
 * const strictMiddleware = permissionMiddleware({
 *   permissions: ['invoice.read', 'invoice.write'],
 *   mode: 'all'
 * });
 * 
 * // Wildcard permissions
 * const invoiceAllMiddleware = permissionMiddleware(['invoice.*']);
 * 
 * // Role-based permissions
 * const roleBasedMiddleware = permissionMiddleware({
 *   permissions: ['invoice.read'],
 *   rolePermissions: {
 *     'admin': ['*.*'],
 *     'manager': ['invoice.*'],
 *     'user': ['invoice.read'],
 *   }
 * });
 * 
 * // With role hierarchy
 * const hierarchicalMiddleware = permissionMiddleware({
 *   permissions: ['invoice.write'],
 *   rolePermissions: {
 *     'admin': ['invoice.*'],
 *     'manager': ['invoice.read'],
 *   },
 *   roleHierarchy: {
 *     'admin': ['manager', 'user'],
 *     'manager': ['user'],
 *   }
 * });
 * ```
 */
export function permissionMiddleware(
  permissions: string | string[] | PermissionMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  // Handle shorthand: permissionMiddleware(['invoice.read'])
  const options: PermissionMiddlewareOptions = Array.isArray(permissions) || typeof permissions === 'string'
    ? { permissions }
    : permissions;

  const {
    permissions: requiredPermissions,
    permissionsPath = 'user.permissions',
    rolesPath = 'user.roles',
    rolePermissions,
    roleHierarchy,
    mode = 'any',
    requireUser = true,
    redirect,
  } = options;

  const requiredPerms = Array.isArray(requiredPermissions)
    ? requiredPermissions
    : [requiredPermissions];

  return createMiddleware('permission', (context: MiddlewareContext) => {
    // Check if user exists if required
    if (requireUser) {
      const user = getValueByPath(context, 'user');
      if (user == null) {
        if (redirect) {
          return { allow: false, redirect } as MiddlewareResponse;
        }
        return false;
      }
    }

    // Get user permissions
    const userPermissions = getValueByPath(context, permissionsPath);
    const userPermsArray = Array.isArray(userPermissions)
      ? userPermissions as string[]
      : [];

    // Get user roles
    const userRoles = getValueByPath(context, rolesPath);
    const userRolesArray = Array.isArray(userRoles)
      ? userRoles as string[]
      : [];

    // Resolve roles with hierarchy if provided
    const resolvedRoles = roleHierarchy
      ? resolveRoles(userRolesArray, roleHierarchy)
      : userRolesArray;

    // Collect all effective permissions
    const effectivePermissions = new Set<string>(userPermsArray);

    // Add permissions from roles if rolePermissions mapping is provided
    if (rolePermissions) {
      for (const role of resolvedRoles) {
        const rolePerms = rolePermissions[role];
        if (Array.isArray(rolePerms)) {
          for (const perm of rolePerms) {
            effectivePermissions.add(perm);
          }
        }
      }
    }

    const effectivePermsArray = Array.from(effectivePermissions);

    // Check permissions based on mode
    const hasAccess = mode === 'all'
      ? hasAllPermissions(effectivePermsArray, requiredPerms)
      : hasPermission(effectivePermsArray, requiredPerms);

    if (!hasAccess) {
      if (redirect) {
        return { allow: false, redirect } as MiddlewareResponse;
      }
      return false;
    }

    return true;
  });
}

