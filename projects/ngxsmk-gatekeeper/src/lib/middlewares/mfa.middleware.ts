import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * MFA method
 */
export type MFAMethod = 'totp' | 'sms' | 'email' | 'push';

/**
 * Configuration options for MFA middleware
 */
export interface MFAMiddlewareOptions {
  /**
   * Whether MFA is required
   * Default: true
   */
  required?: boolean;
  /**
   * Allowed MFA methods
   * Default: ['totp', 'sms', 'email']
   */
  methods?: MFAMethod[];
  /**
   * Path to MFA status in context
   * Default: 'user.mfaVerified'
   */
  mfaPath?: string;
  /**
   * Path to MFA method in context
   * Default: 'user.mfaMethod'
   */
  mfaMethodPath?: string;
  /**
   * Redirect URL when MFA is required
   */
  redirect?: string;
  /**
   * Custom message when MFA is required
   */
  message?: string;
}



/**
 * Creates middleware that enforces multi-factor authentication
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createMFAMiddleware(
  options: MFAMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    required = true,
    methods = ['totp', 'sms', 'email'],
    mfaPath = 'user.mfaVerified',
    mfaMethodPath = 'user.mfaMethod',
    redirect,
    message = 'Multi-factor authentication required',
  } = options;

  return createMiddleware('mfa', (context: MiddlewareContext) => {
    if (!required) {
      return true;
    }

    const mfaVerified = getValueByPath(context, mfaPath);
    const mfaMethod = getValueByPath(context, mfaMethodPath);

    if (mfaVerified !== true) {
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    // Check if method is allowed
    if (mfaMethod && typeof mfaMethod === 'string' && methods.length > 0) {
      if (!methods.includes(mfaMethod as MFAMethod)) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: `MFA method ${mfaMethod} is not allowed`,
          };
        }
        return false;
      }
    }

    return true;
  });
}

