import { definePipeline, createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Configuration options for public-only preset
 */
export interface PublicOnlyPresetOptions {
  /**
   * If true, redirects authenticated users away from public routes
   * Default: false (allows both authenticated and unauthenticated users)
   */
  redirectAuthenticated?: boolean;
  /**
   * Redirect path for authenticated users (if redirectAuthenticated is true)
   * Default: '/dashboard'
   */
  redirectPath?: string;
  /**
   * Path to check authentication status
   * Default: 'user.isAuthenticated'
   */
  authPath?: string;
}

/**
 * Creates a public-only preset pipeline
 * 
 * This preset ensures routes are accessible to everyone (both authenticated and unauthenticated users).
 * Optionally, it can redirect authenticated users away from public routes.
 * 
 * @param options - Configuration options for the preset
 * @returns A middleware pipeline for public routes
 * 
 * @example
 * ```typescript
 * // Basic usage (allows everyone)
 * const publicPreset = publicOnlyPreset();
 * 
 * // Redirect authenticated users away
 * const publicPreset = publicOnlyPreset({
 *   redirectAuthenticated: true,
 *   redirectPath: '/dashboard'
 * });
 * 
 * // Use in GatekeeperConfig
 * provideGatekeeper({
 *   middlewares: [publicPreset],
 *   onFail: '/'
 * });
 * ```
 */
export function publicOnlyPreset(
  options: PublicOnlyPresetOptions = {}
): ReturnType<typeof definePipeline> {
  const {
    redirectAuthenticated = false,
    redirectPath = '/dashboard',
    authPath = 'user.isAuthenticated',
  } = options;



  const middleware = createMiddleware('public-only', (context: MiddlewareContext) => {
    if (!redirectAuthenticated) {
      // Allow everyone (both authenticated and unauthenticated)
      return true;
    }

    // Check if user is authenticated
    const isAuthenticated = getValueByPath(context, authPath);

    if (Boolean(isAuthenticated)) {
      // User is authenticated, redirect them away
      return {
        allow: false,
        redirect: redirectPath,
      };
    }

    // User is not authenticated, allow access
    return true;
  });

  return definePipeline('publicOnlyPreset', [middleware]);
}

