import { createMiddleware, getValueByPath, setValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Configuration options for JWT refresh middleware
 */
export interface JWTRefreshMiddlewareOptions {
  /**
   * Threshold in seconds before token expiry to trigger refresh
   * Default: 300 (5 minutes)
   */
  refreshThreshold?: number;
  /**
   * Whether to automatically refresh token
   * Default: true
   */
  autoRefresh?: boolean;
  /**
   * Refresh endpoint URL
   * Default: '/api/auth/refresh'
   */
  refreshEndpoint?: string;
  /**
   * Path to JWT token in context
   * Default: 'token'
   */
  tokenPath?: string;
  /**
   * Path to token expiry in context
   * Default: 'tokenExpiry'
   */
  expiryPath?: string;
  /**
   * Function to refresh the token
   */
  refreshToken?: (context: MiddlewareContext) => Promise<{ token: string; expiresAt: number } | null>;
}



/**
 * Creates middleware that automatically refreshes JWT tokens
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createJWTRefreshMiddleware(
  options: JWTRefreshMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    refreshThreshold = 300,
    autoRefresh = true,
    refreshEndpoint = '/api/auth/refresh',
    tokenPath = 'token',
    expiryPath = 'tokenExpiry',
    refreshToken,
  } = options;

  return createMiddleware('jwt-refresh', async (context: MiddlewareContext) => {
    if (!autoRefresh) {
      return true;
    }

    const token = getValueByPath(context, tokenPath);
    const expiry = getValueByPath(context, expiryPath);

    if (!token || !expiry) {
      // No token to refresh
      return true;
    }

    const expiryTime = typeof expiry === 'number' ? expiry : parseInt(String(expiry), 10);
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiryTime - now;

    // Check if token needs refresh
    if (timeUntilExpiry <= refreshThreshold) {
      if (refreshToken) {
        try {
          const result = await refreshToken(context);
          if (result) {
            // Update token in context
            setValueByPath(context as Record<string, unknown>, tokenPath, result.token);
            setValueByPath(context as Record<string, unknown>, expiryPath, result.expiresAt);
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          // Don't fail the request, just log the error
        }
      } else if (typeof fetch !== 'undefined') {
        // Default refresh implementation
        try {
          const response = await fetch(refreshEndpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.token && data.expiresAt) {
              setValueByPath(context as Record<string, unknown>, tokenPath, data.token);
              setValueByPath(context as Record<string, unknown>, expiryPath, data.expiresAt);
            }
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
        }
      }
    }

    return true;
  });
}

