import { createBotProtectionMiddleware } from './bot-protection.middleware';
import { MiddlewareContext } from '../core';

describe('BotProtectionMiddleware', () => {
    let context: MiddlewareContext;

    beforeEach(() => {
        context = {
            contextType: 'http',
            shared: new Map(),
        } as unknown as MiddlewareContext;
    });

    it('should allow request if token is valid', async () => {
        context['request'] = {
            headers: new Map([['x-captcha-token', 'valid-token']]),
        };

        const verify = jasmine.createSpy('verify').and.returnValue(true);
        const middleware = createBotProtectionMiddleware({
            verify,
        });

        const result = await middleware(context);
        expect(result).toBeTrue();
        expect(verify).toHaveBeenCalledWith('valid-token', context);
    });

    it('should block request if token is invalid', async () => {
        context['request'] = {
            headers: new Map([['x-captcha-token', 'invalid-token']]),
        };

        const verify = jasmine.createSpy('verify').and.returnValue(false);
        const middleware = createBotProtectionMiddleware({
            verify,
        });

        const result = await middleware(context);
        expect(result).toBeFalse();
    });

    it('should block request if token is missing and requireToken is true', async () => {
        const verify = jasmine.createSpy('verify');
        const middleware = createBotProtectionMiddleware({
            verify,
            requireToken: true,
        });

        const result = await middleware(context);
        expect(result).toBeFalse();
        expect(verify).not.toHaveBeenCalled();
    });

    it('should allow request if token is missing and requireToken is false', async () => {
        const verify = jasmine.createSpy('verify');
        const middleware = createBotProtectionMiddleware({
            verify,
            requireToken: false,
        });

        const result = await middleware(context);
        expect(result).toBeTrue();
        expect(verify).not.toHaveBeenCalled();
    });

    it('should resolve token from custom path', async () => {
        context['custom'] = { token: 'custom-token' };

        const verify = jasmine.createSpy('verify').and.returnValue(true);
        const middleware = createBotProtectionMiddleware({
            verify,
            tokenPath: 'custom.token',
        });

        const result = await middleware(context);
        expect(result).toBeTrue();
        expect(verify).toHaveBeenCalledWith('custom-token', context);
    });
});
