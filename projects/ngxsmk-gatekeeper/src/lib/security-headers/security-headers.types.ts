/**
 * Security headers types and utilities
 */

export * from './csp.utils';
import { CSPDirectives } from './csp.utils';

/**
 * Security headers configuration
 */
export interface SecurityHeadersConfig {
  /**
   * Headers to inject into HTTP requests
   * Key-value pairs where key is the header name and value is the header value
   */
  headers: Record<string, string | (() => string)>;
  /**
   * Whether to overwrite existing headers with the same name
   * Default: false (existing headers take precedence)
   */
  overwrite?: boolean;
}

/**
 * Internal key used to store headers in middleware context
 */
export const SECURITY_HEADERS_KEY = '_securityHeaders';

/**
 * Headers entry in context
 */
export interface SecurityHeadersEntry {
  headers: Record<string, string>;
  overwrite: boolean;
}

/**
 * Options for Content Security Policy helper
 */
export interface CSPOptions {
  /**
   * CSP Directives
   */
  directives: CSPDirectives;
  /**
   * Whether to use report-only mode (Content-Security-Policy-Report-Only)
   */
  reportOnly?: boolean;
}

/**
 * Options for Strict Transport Security (HSTS) helper
 */
export interface HSTSOptions {
  /**
   * Max age in seconds
   * Default: 31536000 (1 year)
   */
  maxAge?: number;
  /**
   * Whether to include subdomains
   * Default: true
   */
  includeSubDomains?: boolean;
  /**
   * Whether to enable preload
   * Default: false
   */
  preload?: boolean;
}

/**
 * Supported X-Frame-Options values
 */
export type FrameOptionsValue = 'DENY' | 'SAMEORIGIN';
