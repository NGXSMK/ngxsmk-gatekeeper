import { createMiddleware } from '../helpers';
import { MiddlewareContext } from '../core';
import { AuditLogEntry, AuditMiddlewareConfig } from './audit.types';
import { sanitizeObject, extractUserId } from './audit.sanitize';

/**
 * Gets a value from an object using a dot-separated path
 */
function getValueByPath(obj: unknown, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

/**
 * Creates an audit middleware that logs access decisions
 * 
 * This middleware should be placed at the end of the middleware chain
 * to capture the final decision. It wraps the execution and logs after
 * the decision is made.
 * 
 * @param config - Audit middleware configuration
 * @returns A middleware function that logs access decisions
 * 
 * @example
 * ```typescript
 * import { createAuditMiddleware } from 'ngxsmk-gatekeeper/lib/audit';
 * import { ConsoleAuditSink, RemoteApiAuditSink } from 'ngxsmk-gatekeeper/lib/audit';
 * 
 * // Console logging (development)
 * const auditMiddleware = createAuditMiddleware({
 *   sinks: new ConsoleAuditSink(),
 * });
 * 
 * // Remote API logging (production)
 * const auditMiddleware = createAuditMiddleware({
 *   sinks: new RemoteApiAuditSink({
 *     endpoint: 'https://api.example.com/audit',
 *     batch: true,
 *   }),
 * });
 * 
 * // Multiple sinks
 * const auditMiddleware = createAuditMiddleware({
 *   sinks: [
 *     new ConsoleAuditSink(),
 *     new RemoteApiAuditSink({ endpoint: 'https://api.example.com/audit' }),
 *   ],
 * });
 * 
 * // Use in GatekeeperConfig
 * provideGatekeeper({
 *   middlewares: [authMiddleware, auditMiddleware],
 *   onFail: '/login',
 * });
 * ```
 */
export function createAuditMiddleware(
  config: AuditMiddlewareConfig
): ReturnType<typeof createMiddleware> {
  const {
    sinks,
    userIdPath = ['user.id', 'user.sessionId', 'user.userId', 'session.id'],
    includeMetadata = false,
    metadataFields = [],
    excludeFields = [],
  } = config;

  const sinkArray = Array.isArray(sinks) ? sinks : [sinks];

  return createMiddleware('audit', async (context: MiddlewareContext) => {
    const resource = 
      (context['url'] as string) || 
      (context['path'] as string) || 
      (context['route'] as { path?: string } | undefined)?.path ||
      'unknown';

    const method = context['method'] as string | undefined;

    const contextType: 'route' | 'http' = context['request'] ? 'http' : 'route';
    const userIdPaths = Array.isArray(userIdPath) ? userIdPath : [userIdPath];
    const userId = extractUserId(context as Record<string, unknown>, userIdPaths);

    let metadata: Record<string, unknown> | undefined;
    if (includeMetadata) {
      const sanitizedContext = sanitizeObject(context, excludeFields);
      
      if (metadataFields.length > 0) {
        metadata = {};
        for (const field of metadataFields) {
          const value = getValueByPath(sanitizedContext, field);
          if (value !== undefined) {
            metadata[field] = value;
          }
        }
      } else {
        metadata = sanitizedContext;
      }
    }

    const entry: AuditLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...(userId && { userId }),
      resource,
      ...(method && { method }),
      decision: 'allow', // Will be updated after middleware execution
      contextType,
      ...(metadata && { metadata }),
    };

    // Log to all sinks (fire and forget - don't block execution)
    for (const sink of sinkArray) {
      try {
        const result = sink.log(entry);
        if (result instanceof Promise) {
          result.catch((error) => {
            console.error('[Audit] Sink logging error:', error);
          });
        }
      } catch (error) {
        console.error('[Audit] Sink logging error:', error);
      }
    }

    return true;
  });
}

/**
 * Creates an audit wrapper that logs the final decision
 * 
 * This should be called after middleware execution to log the result.
 * 
 * @param config - Audit configuration
 * @param context - Middleware context
 * @param resource - Resource path/URL
 * @param method - HTTP method (if applicable)
 * @param decision - Final decision (allow/deny)
 * @param reason - Optional reason for denial
 * @param redirect - Optional redirect path
 */
export async function logAuditDecision(
  config: AuditMiddlewareConfig,
  context: MiddlewareContext,
  resource: string,
  method: string | undefined,
  decision: 'allow' | 'deny',
  reason?: string,
  redirect?: string
): Promise<void> {
  const {
    sinks,
    userIdPath = ['user.id', 'user.sessionId', 'user.userId', 'session.id'],
    includeMetadata = false,
    metadataFields = [],
    excludeFields = [],
  } = config;

  const sinkArray = Array.isArray(sinks) ? sinks : [sinks];

  // Extract user identifier (sanitized)
  const userIdPaths = Array.isArray(userIdPath) ? userIdPath : [userIdPath];
  const userId = extractUserId(context as Record<string, unknown>, userIdPaths);

  let metadata: Record<string, unknown> | undefined;
  if (includeMetadata) {
      const sanitizedContext = sanitizeObject(context, excludeFields);
      
      if (metadataFields.length > 0) {
        metadata = {};
      for (const field of metadataFields) {
        const value = getValueByPath(sanitizedContext, field);
        if (value !== undefined) {
            metadata[field] = value;
          }
        }
      } else {
        metadata = sanitizedContext;
      }
    }

  const contextType: 'route' | 'http' = context['request'] ? 'http' : 'route';

  const entry: AuditLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...(userId && { userId }),
    resource,
    ...(method && { method }),
    decision,
    ...(reason && { reason }),
    ...(redirect && { redirect }),
    contextType,
    ...(metadata && { metadata }),
  };

  const logPromises = sinkArray.map(async (sink) => {
    try {
      const result = sink.log(entry);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error('[Audit] Sink logging error:', error);
    }
  });

  await Promise.allSettled(logPromises);
}

