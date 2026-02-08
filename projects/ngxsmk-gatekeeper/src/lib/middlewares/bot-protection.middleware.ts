import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext, MiddlewareResponse } from '../core';

/**
 * Configuration options for bot protection middleware
 */
export interface BotProtectionMiddlewareOptions {
    /**
     * Path to the captcha token in the context or request
     * Default: Looks in 'X-Captcha-Token' header, then 'captchaToken' query param, then body 'captchaToken'
     */
    tokenPath?: string | string[];
    /**
     * Verification function that validates the token
     * Returns true if valid, false if invalid
     */
    verify: (token: string, context: MiddlewareContext) => boolean | Promise<boolean>;
    /**
     * Optional custom error message
     * Default: 'Bot detected'
     */
    message?: string;
    /**
     * Optional redirect path when bot is detected
     */
    redirect?: string;
    /**
     * Whether to block requests if no token is found
     * Default: true
     */
    requireToken?: boolean;
    /**
     * Score threshold for verification (if verifier returns a score)
     * Default: 0.5
     */
    scoreThreshold?: number;
}

/**
 * Resolves token from context using various strategies
 */
function resolveToken(context: MiddlewareContext, paths?: string | string[]): string | undefined {
    const strategies = paths ? (Array.isArray(paths) ? paths : [paths]) : [
        'request.headers.x-captcha-token',
        'request.headers.x-recaptcha-token',
        'queryParams.captchaToken',
        'body.captchaToken',
    ];

    for (const path of strategies) {
        if (path.startsWith('request.headers.')) {
            const headerName = path.replace('request.headers.', '');
            const req = context['request'] as { headers?: Map<string, string> | Record<string, string> };
            if (req?.headers) {
                if (req.headers instanceof Map) {
                    const val = req.headers.get(headerName) || req.headers.get(headerName.toLowerCase());
                    if (val) return val;
                } else {
                    // Record<string, string>
                    // Case insensitive search
                    const keys = Object.keys(req.headers);
                    const key = keys.find(k => k.toLowerCase() === headerName.toLowerCase());
                    if (key && req.headers[key]) return req.headers[key];
                }
            }
        } else {
            // Standard path resolution
            const val = getValueByPath(context, path);
            if (val && typeof val === 'string') return val;
        }
    }

    return undefined;
}

/**
 * Creates a bot protection middleware
 * 
 * Verifies that the request comes from a human or trusted source using a token verification strategy.
 * Useful for integrating reCAPTCHA, hCaptcha, or Turnstile.
 * 
 * @param options - Bot protection configuration
 * @returns Middleware function
 * 
 * @example
 * ```typescript
 * const botMiddleware = createBotProtectionMiddleware({
 *   verify: async (token) => {
 *     const result = await verifyRecaptcha(token);
 *     return result.success;
 *   },
 *   redirect: '/verify-human'
 * });
 * ```
 */
export function createBotProtectionMiddleware(
    options: BotProtectionMiddlewareOptions
): ReturnType<typeof createMiddleware> {
    const {
        verify,
        tokenPath,
        message = 'Bot detected',
        redirect,
        requireToken = true,
    } = options;

    return createMiddleware('bot-protection', async (context: MiddlewareContext) => {
        const token = resolveToken(context, tokenPath);

        if (!token) {
            if (requireToken) {
                if (redirect) {
                    return { allow: false, redirect, reason: 'Missing captcha token' } as MiddlewareResponse;
                }
                return false;
            }
            return true;
        }

        try {
            const isValid = await verify(token, context);

            if (!isValid) {
                if (redirect) {
                    return { allow: false, redirect, reason: message } as MiddlewareResponse;
                }
                return false;
            }

            return true;
        } catch (error) {
            console.error('Bot verification error:', error);
            // Fail open or closed? Typically closed for security, but allow optional config?
            // For now, fail closed.
            return false;
        }
    });
}
