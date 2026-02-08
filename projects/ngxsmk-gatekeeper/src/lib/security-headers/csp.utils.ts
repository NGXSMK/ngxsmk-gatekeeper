/**
 * Content Security Policy (CSP) directive mapping
 */
export interface CSPDirectives {
    'default-src'?: string[];
    'script-src'?: string[];
    'style-src'?: string[];
    'img-src'?: string[];
    'connect-src'?: string[];
    'font-src'?: string[];
    'object-src'?: string[];
    'media-src'?: string[];
    'frame-src'?: string[];
    'sandbox'?: string[];
    'report-uri'?: string[];
    'child-src'?: string[];
    'form-action'?: string[];
    'frame-ancestors'?: string[];
    'plugin-types'?: string[];
    'base-uri'?: string[];
    'report-to'?: string[];
    'worker-src'?: string[];
    'manifest-src'?: string[];
    'prefetch-src'?: string[];
    'navigate-to'?: string[];
    'upgrade-insecure-requests'?: boolean;
    'block-all-mixed-content'?: boolean;
}

/**
 * Generates a Content-Security-Policy string from directives
 * 
 * @param directives - CSP directives object
 * @returns CSP string
 */
export function generateCSP(directives: CSPDirectives): string {
    const parts: string[] = [];

    for (const [key, value] of Object.entries(directives)) {
        if (typeof value === 'boolean') {
            if (value) {
                parts.push(key);
            }
        } else if (Array.isArray(value)) {
            if (value.length > 0) {
                parts.push(`${key} ${value.join(' ')}`);
            }
        }
    }

    return parts.join('; ');
}

/**
 * Common CSP sources
 */
export const CSP_SOURCES = {
    SELF: "'self'",
    NONE: "'none'",
    UNSAFE_INLINE: "'unsafe-inline'",
    UNSAFE_EVAL: "'unsafe-eval'",
    DATA: "data:",
    BLOB: "blob:",
    HTTPS: "https:",
    WSS: "wss:",
    STRICT_DYNAMIC: "'strict-dynamic'",
    REPORT_SAMPLE: "'report-sample'",
};
