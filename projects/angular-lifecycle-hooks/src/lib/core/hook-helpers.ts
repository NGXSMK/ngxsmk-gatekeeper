/**
 * Helper functions for creating scoped hooks
 * Framework agnostic - no Angular imports
 */

import { 
  RouteHookScope, 
  HttpHookScope, 
  ScopedRouteHook, 
  ScopedHttpHook,
  RouteHookContext,
  HttpHookContext,
  HookResult
} from './hook.types';

/**
 * Creates a scoped beforeRoute hook
 * 
 * @example
 * ```typescript
 * beforeRoute({ path: '/admin/**' }, (ctx) => {
 *   console.log('Admin route:', ctx.navigation.to);
 *   return true;
 * })
 * ```
 */
export function beforeRoute(
  scope: RouteHookScope,
  hook: (context: RouteHookContext) => HookResult
): ScopedRouteHook<'beforeRoute'> {
  return { scope, hook };
}

/**
 * Creates a scoped afterRoute hook
 * 
 * @example
 * ```typescript
 * afterRoute({ path: '/admin/**' }, (ctx) => {
 *   console.log('Navigated to admin route:', ctx.navigation.to);
 * })
 * ```
 */
export function afterRoute(
  scope: RouteHookScope,
  hook: (context: RouteHookContext) => void | Promise<void>
): ScopedRouteHook<'afterRoute'> {
  return { scope, hook };
}

/**
 * Creates a scoped routeBlocked hook
 * 
 * @example
 * ```typescript
 * routeBlocked({ path: '/admin/**' }, (ctx) => {
 *   console.log('Admin route blocked:', ctx.navigation.to);
 * })
 * ```
 */
export function routeBlocked(
  scope: RouteHookScope,
  hook: (context: RouteHookContext) => void | Promise<void>
): ScopedRouteHook<'routeBlocked'> {
  return { scope, hook };
}

/**
 * Creates a scoped beforeRequest hook
 * 
 * @example
 * ```typescript
 * beforeRequest({ method: 'POST' }, (ctx) => {
 *   console.log('POST request:', ctx.request?.url);
 *   return true;
 * })
 * 
 * beforeRequest({ url: '/api/**', method: 'POST' }, (ctx) => {
 *   console.log('API POST request:', ctx.request?.url);
 *   return true;
 * })
 * ```
 */
export function beforeRequest(
  scope: HttpHookScope,
  hook: (context: HttpHookContext) => HookResult
): ScopedHttpHook<'beforeRequest'> {
  return { scope, hook };
}

/**
 * Creates a scoped afterResponse hook
 * 
 * @example
 * ```typescript
 * afterResponse({ method: 'POST' }, (ctx) => {
 *   console.log('POST response:', ctx.response?.status);
 * })
 * ```
 */
export function afterResponse(
  scope: HttpHookScope,
  hook: (context: HttpHookContext) => void | Promise<void>
): ScopedHttpHook<'afterResponse'> {
  return { scope, hook };
}

/**
 * Creates a scoped requestBlocked hook
 * 
 * @example
 * ```typescript
 * requestBlocked({ method: 'POST' }, (ctx) => {
 *   console.log('POST request blocked:', ctx.request?.url);
 * })
 * ```
 */
export function requestBlocked(
  scope: HttpHookScope,
  hook: (context: HttpHookContext) => void | Promise<void>
): ScopedHttpHook<'requestBlocked'> {
  return { scope, hook };
}

/**
 * Creates a scoped requestFailed hook
 * 
 * @example
 * ```typescript
 * requestFailed({ method: 'POST' }, (ctx) => {
 *   console.log('POST request failed:', ctx.error);
 * })
 * ```
 */
export function requestFailed(
  scope: HttpHookScope,
  hook: (context: HttpHookContext & { error: unknown }) => void | Promise<void>
): ScopedHttpHook<'requestFailed'> {
  return { scope, hook };
}



