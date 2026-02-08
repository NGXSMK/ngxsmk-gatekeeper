import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import {
  SecurityHeadersConfig,
  SECURITY_HEADERS_KEY,
  SecurityHeadersEntry,
  CSPOptions,
  HSTSOptions,
  FrameOptionsValue,
} from './security-headers.types';
import { generateCSP } from './csp.utils';

/**
 * Creates a middleware that injects security headers into HTTP requests
 * 
 * Headers are added to the middleware context and will be applied to the HTTP request
 * by the gatekeeper interceptor after middleware execution.
 * 
 * @param config - Security headers configuration
 * @returns A middleware function that adds headers to the context
 */
export function securityHeadersMiddleware(
  config: SecurityHeadersConfig
): ReturnType<typeof createMiddleware> {
  const { headers, overwrite = false } = config;

  return createMiddleware('security-headers', (context: MiddlewareContext) => {
    // Resolve header values (support both static strings and functions)
    const resolvedHeaders: Record<string, string> = {};

    for (const [key, value] of Object.entries(headers)) {
      if (typeof value === 'function') {
        try {
          resolvedHeaders[key] = value();
        } catch (error) {
          console.warn(`[Security Headers] Failed to resolve header "${key}":`, error);
        }
      } else {
        resolvedHeaders[key] = value;
      }
    }

    // Get existing headers from context (if any)
    const existingEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry | undefined;

    if (existingEntry) {
      // Merge with existing headers
      const mergedHeaders = overwrite
        ? { ...existingEntry.headers, ...resolvedHeaders }
        : { ...resolvedHeaders, ...existingEntry.headers };

      // Use the more permissive overwrite setting
      const mergedOverwrite = overwrite || existingEntry.overwrite;

      context[SECURITY_HEADERS_KEY] = {
        headers: mergedHeaders,
        overwrite: mergedOverwrite,
      } as SecurityHeadersEntry;
    } else {
      // Create new entry
      context[SECURITY_HEADERS_KEY] = {
        headers: resolvedHeaders,
        overwrite,
      } as SecurityHeadersEntry;
    }

    return true;
  });
}

/**
 * Creates Content-Security-Policy middleware
 * 
 * @param options - CSP Options (directives)
 */
export function createCSP(options: CSPOptions): ReturnType<typeof securityHeadersMiddleware> {
  const { directives, reportOnly = false } = options;
  const headerName = reportOnly ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';
  const headerValue = generateCSP(directives);

  return securityHeadersMiddleware({
    headers: {
      [headerName]: headerValue,
    },
    overwrite: true,
  });
}

/**
 * Creates Strict-Transport-Security (HSTS) middleware
 * 
 * @param options - HSTS Options
 */
export function createHSTS(options: HSTSOptions = {}): ReturnType<typeof securityHeadersMiddleware> {
  const { maxAge = 31536000, includeSubDomains = true, preload = false } = options;
  let headerValue = `max-age=${maxAge}`;

  if (includeSubDomains) {
    headerValue += '; includeSubDomains';
  }
  if (preload) {
    headerValue += '; preload';
  }

  return securityHeadersMiddleware({
    headers: {
      'Strict-Transport-Security': headerValue,
    },
    overwrite: true,
  });
}

/**
 * Creates X-Frame-Options middleware
 * 
 * @param value - Frame options value (DENY or SAMEORIGIN)
 */
export function createFrameOptions(value: FrameOptionsValue = 'SAMEORIGIN'): ReturnType<typeof securityHeadersMiddleware> {
  return securityHeadersMiddleware({
    headers: {
      'X-Frame-Options': value,
    },
    overwrite: true,
  });
}

/**
 * Creates X-Content-Type-Options: nosniff middleware
 */
export function createContentTypeOptions(): ReturnType<typeof securityHeadersMiddleware> {
  return securityHeadersMiddleware({
    headers: {
      'X-Content-Type-Options': 'nosniff',
    },
    overwrite: true,
  });
}

/**
 * Creates X-XSS-Protection middleware
 * 
 * @param enable - Whether to enable or disable (0) XSS protection. Default: 0 (disabled by modern standards)
 * @param mode - Block mode (1; mode=block). Default: false
 */
export function createXSSProtection(enable: boolean = false, mode: boolean = false): ReturnType<typeof securityHeadersMiddleware> {
  let value = enable ? '1' : '0';
  if (enable && mode) {
    value += '; mode=block';
  }

  return securityHeadersMiddleware({
    headers: {
      'X-XSS-Protection': value,
    },
    overwrite: true,
  });
}

/**
 * Creates Referrer-Policy middleware
 * 
 * @param policy - Referrer policy value
 */
export function createReferrerPolicy(
  policy: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url' = 'strict-origin-when-cross-origin'
): ReturnType<typeof securityHeadersMiddleware> {
  return securityHeadersMiddleware({
    headers: {
      'Referrer-Policy': policy,
    },
    overwrite: true,
  });
}

/**
 * Creates a Permissions-Policy middleware
 * 
 * @param features - Feature policy mapping (feature: allow list)
 */
export function createPermissionsPolicy(features: Record<string, string[]>): ReturnType<typeof securityHeadersMiddleware> {
  const parts: string[] = [];

  for (const [feature, allowList] of Object.entries(features)) {
    if (allowList.length > 0) {
      parts.push(`${feature}=(${allowList.join(' ')})`);
    } else {
      parts.push(`${feature}=()`);
    }
  }

  return securityHeadersMiddleware({
    headers: {
      'Permissions-Policy': parts.join(', '),
    },
    overwrite: true,
  });
}

/**
 * Helper function to create common security headers middleware
 * 
 * @param options - Common security headers options
 */
export interface CommonSecurityHeadersOptions {
  requestSource?: string | (() => string);
  clientVersion?: string | (() => string);
  customHeaders?: Record<string, string | (() => string)>;
  overwrite?: boolean;
}

export function createSecurityHeaders(
  options: CommonSecurityHeadersOptions
): ReturnType<typeof securityHeadersMiddleware> {
  const { requestSource, clientVersion, customHeaders, overwrite } = options;

  const headers: Record<string, string | (() => string)> = {
    ...(requestSource && { 'X-Request-Source': requestSource }),
    ...(clientVersion && { 'X-Client-Version': clientVersion }),
    ...customHeaders,
  };

  return securityHeadersMiddleware({
    headers,
    ...(overwrite !== undefined && { overwrite }),
  });
}
