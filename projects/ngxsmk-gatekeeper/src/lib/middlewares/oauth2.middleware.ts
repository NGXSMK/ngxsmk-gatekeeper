import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * OAuth2 provider
 */
export type OAuth2Provider = 'google' | 'github' | 'microsoft' | 'auth0' | 'custom';

/**
 * Configuration options for OAuth2 middleware
 */
export interface OAuth2MiddlewareOptions {
  /**
   * OAuth2 provider
   */
  provider: OAuth2Provider;
  /**
   * Client ID
   */
  clientId: string;
  /**
   * Client secret (for server-side)
   */
  clientSecret?: string;
  /**
   * Authorization endpoint
   */
  authorizationEndpoint?: string;
  /**
   * Token endpoint
   */
  tokenEndpoint?: string;
  /**
   * Scopes to request
   * Default: ['openid', 'profile', 'email']
   */
  scopes?: string[];
  /**
   * Redirect URI
   */
  redirectUri?: string;
  /**
   * Path to access token in context
   * Default: 'token'
   */
  tokenPath?: string;
  /**
   * Function to validate access token
   */
  validateToken?: (token: string, context: MiddlewareContext) => boolean | Promise<boolean>;
  /**
   * Redirect URL when authentication is required
   */
  redirect?: string;
}



/**
 * Creates middleware that handles OAuth2 authentication
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createOAuth2Middleware(
  options: OAuth2MiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    provider,
    tokenPath = 'token',
    validateToken,
    redirect,
  } = options;

  return createMiddleware(`oauth2:${provider}`, async (context: MiddlewareContext) => {
    const token = getValueByPath(context, tokenPath);

    if (!token || typeof token !== 'string') {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: 'OAuth2 authentication required',
        };
      }
      return false;
    }

    // Validate token if validator provided
    if (validateToken) {
      const isValid = await validateToken(token, context);
      if (!isValid) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: 'Invalid OAuth2 token',
          };
        }
        return false;
      }
    }

    return true;
  });
}

