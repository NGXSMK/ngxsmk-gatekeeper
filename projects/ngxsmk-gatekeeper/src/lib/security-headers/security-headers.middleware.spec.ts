import { createCSP, createHSTS, createFrameOptions, SECURITY_HEADERS_KEY, SecurityHeadersEntry, CSPOptions } from './';
import { MiddlewareContext } from '../core';

describe('SecurityHeadersMiddleware', () => {
    let context: MiddlewareContext;

    beforeEach(() => {
        context = {
            contextType: 'http',
            shared: new Map(),
        } as unknown as MiddlewareContext;
    });

    it('should set CSP header', async () => {
        const options: CSPOptions = {
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'unsafe-inline'"],
            },
        };

        const middleware = createCSP(options);
        await middleware(context);

        const headersEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry;
        expect(headersEntry).toBeTruthy();
        expect(headersEntry.headers['Content-Security-Policy']).toBe("default-src 'self'; script-src 'self' 'unsafe-inline'");
        expect(headersEntry.overwrite).toBeTrue();
    });

    it('should set HSTS header', async () => {
        const middleware = createHSTS({ maxAge: 300, includeSubDomains: true });
        await middleware(context);

        const headersEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry;
        expect(headersEntry.headers['Strict-Transport-Security']).toBe('max-age=300; includeSubDomains');
    });

    it('should set X-Frame-Options header', async () => {
        const middleware = createFrameOptions('DENY');
        await middleware(context);

        const headersEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry;
        expect(headersEntry.headers['X-Frame-Options']).toBe('DENY');
    });

    it('should merge headers', async () => {
        context[SECURITY_HEADERS_KEY] = {
            headers: { 'X-Existing': 'value' },
            overwrite: false,
        };

        const middleware = createFrameOptions('SAMEORIGIN');
        await middleware(context);

        const headersEntry = context[SECURITY_HEADERS_KEY] as SecurityHeadersEntry;
        expect(headersEntry.headers['X-Existing']).toBe('value');
        expect(headersEntry.headers['X-Frame-Options']).toBe('SAMEORIGIN');
    });
});
