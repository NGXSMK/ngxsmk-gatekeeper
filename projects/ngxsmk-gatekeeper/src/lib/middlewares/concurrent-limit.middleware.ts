import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * Concurrent request tracking
 */
interface ConcurrentRequest {
  id: string;
  startTime: number;
}

/**
 * In-memory concurrent request store (in production, use Redis)
 */
const concurrentStore = new Map<string, ConcurrentRequest[]>();

/**
 * Configuration options for concurrent limit middleware
 */
export interface ConcurrentLimitMiddlewareOptions {
  /**
   * Maximum number of concurrent requests
   * Default: 10
   */
  maxConcurrent?: number;
  /**
   * Whether to limit per user
   * Default: false (global limit)
   */
  perUser?: boolean;
  /**
   * Path to user identifier in context
   * Default: 'user.id'
   */
  userIdPath?: string;
  /**
   * Queue strategy when limit is reached
   * 'fifo' - First in, first out
   * 'reject' - Reject new requests
   * Default: 'reject'
   */
  queueStrategy?: 'fifo' | 'reject';
  /**
   * Maximum queue size (for fifo strategy)
   * Default: 100
   */
  maxQueueSize?: number;
  /**
   * Custom storage for concurrent requests (optional)
   */
  storage?: {
    get: (key: string) => ConcurrentRequest[] | undefined | Promise<ConcurrentRequest[] | undefined>;
    set: (key: string, value: ConcurrentRequest[]) => void | Promise<void>;
  };
  /**
   * Redirect URL when limit exceeded
   */
  redirect?: string;
  /**
   * Custom message when limit exceeded
   */
  message?: string;
}



/**
 * Creates middleware that limits concurrent requests
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
  * const concurrentLimitMiddleware = createConcurrentLimitMiddleware({
    *   maxConcurrent: 10,
    *   perUser: true,
    *   queueStrategy: 'reject'
 * });
 * ```
 */
export function createConcurrentLimitMiddleware(
  options: ConcurrentLimitMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    maxConcurrent = 10,
    perUser = false,
    userIdPath = 'user.id',
    queueStrategy = 'reject',
    maxQueueSize = 100,
    storage,
    redirect,
    message = 'Too many concurrent requests',
  } = options;

  const getRequests = async (key: string): Promise<ConcurrentRequest[]> => {
    if (storage) {
      return (await storage.get(key)) || [];
    }
    return concurrentStore.get(key) || [];
  };

  const setRequests = async (key: string, requests: ConcurrentRequest[]): Promise<void> => {
    if (storage) {
      await storage.set(key, requests);
    } else {
      concurrentStore.set(key, requests);
    }
  };

  return createMiddleware('concurrent-limit', async (context: MiddlewareContext) => {
    // Generate key
    let key = 'global';
    if (perUser) {
      const userId = getValueByPath(context, userIdPath);
      if (userId && typeof userId === 'string') {
        key = `user:${userId} `;
      }
    }

    const requestId = `${Date.now()} -${Math.random()} `;
    const now = Date.now();

    // Get current concurrent requests
    let requests = await getRequests(key);

    // Clean up old requests (older than 5 minutes)
    requests = requests.filter(req => now - req.startTime < 300000);

    // Check if limit is reached
    if (requests.length >= maxConcurrent) {
      if (queueStrategy === 'fifo' && requests.length < maxConcurrent + maxQueueSize) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: `${message}. Please try again later.`,
          };
        }
        return false;
      }

      // Reject the request
      if (redirect) {
        return {
          allow: false,
          redirect,
          reason: message,
        };
      }
      return false;
    }

    // Add current request
    requests.push({
      id: requestId,
      startTime: now,
    });
    await setRequests(key, requests);

    setTimeout(async () => {
      const currentRequests = await getRequests(key);
      const filtered = currentRequests.filter(req => req.id !== requestId);
      await setRequests(key, filtered);
    }, 60000); // Remove after 1 minute (fallback)

    return true;
  });
}

