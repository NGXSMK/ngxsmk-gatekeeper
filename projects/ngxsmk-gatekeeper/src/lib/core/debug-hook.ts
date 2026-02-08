import { MiddlewareContext, MiddlewareResult, NgxMiddleware } from './middleware.types';
import { DebugOptions } from './debug';
import { DEFAULT_SENSITIVE_FIELDS } from '../helpers';

/**
 * Sensitive data keys that should be filtered from debug output
 * These keys are commonly used for authentication tokens, passwords, etc.
 */
const SENSITIVE_KEYS = new Set(DEFAULT_SENSITIVE_FIELDS);

/**
 * Recursively filters sensitive data from an object
 */
function filterSensitiveData(obj: unknown, depth = 0, maxDepth = 3): unknown {
  // Prevent infinite recursion
  if (depth > maxDepth) {
    return '[Max Depth Reached]';
  }

  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => filterSensitiveData(item, depth + 1, maxDepth));
  }

  // Handle objects
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Filter out sensitive keys
    if (SENSITIVE_KEYS.has(lowerKey)) {
      filtered[key] = '[Filtered]';
      continue;
    }

    // Filter out function references (they might contain sensitive data)
    if (typeof value === 'function') {
      filtered[key] = '[Function]';
      continue;
    }

    // Recursively filter nested objects
    filtered[key] = filterSensitiveData(value, depth + 1, maxDepth);
  }

  return filtered;
}

/**
 * Sanitizes context data for debug output
 */
function sanitizeContext(context: MiddlewareContext): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  // Only include safe, non-sensitive context data
  if (context['url'] && typeof context['url'] === 'string') {
    sanitized['url'] = context['url'];
  }
  if (context['path'] && typeof context['path'] === 'string') {
    sanitized['path'] = context['path'];
  }
  if (context['method'] && typeof context['method'] === 'string') {
    sanitized['method'] = context['method'];
  }
  if (context['contextType'] && typeof context['contextType'] === 'string') {
    sanitized['contextType'] = context['contextType'];
  }

  // Filter sensitive data from other context properties
  const filtered = filterSensitiveData(context);
  if (typeof filtered === 'object' && filtered !== null) {
    Object.assign(sanitized, filtered);
  }

  return sanitized;
}

/**
 * Middleware execution record
 */
export interface MiddlewareExecutionRecord {
  id: string;
  timestamp: number;
  middlewareName: string;
  middlewareIndex: number;
  contextType: 'route' | 'http';
  contextPath?: string;
  chunkName?: string;
  result: boolean;
  duration: number;
  error?: string;
  sanitizedContext: Record<string, unknown>;
}

/**
 * Chain execution record
 */
export interface ChainExecutionRecord {
  id: string;
  timestamp: number;
  contextType: 'route' | 'http';
  contextPath?: string;
  chunkName?: string;
  middlewareCount: number;
  result: boolean;
  stoppedAt: number;
  totalDuration: number;
  redirect?: string;
  middlewareExecutions: MiddlewareExecutionRecord[];
}

/**
 * Global debug hook interface
 * 
 * **@experimental** This API is experimental and may change in future versions.
 * Only available in development mode when debug is enabled.
 * 
 * This hook is automatically attached to `window.__NGXSMK_GATEKEEPER__` when:
 * - Running in development mode (NODE_ENV !== 'production')
 * - Debug mode is enabled in GatekeeperConfig
 * - Code is running in a browser environment
 * 
 * @example
 * ```typescript
 * // Access from browser console or extension
 * const hook = window.__NGXSMK_GATEKEEPER__;
 * if (hook) {
 *   // Get execution statistics
 *   const stats = hook.getStats();
 *   console.log('Total chains:', stats.totalChains);
 *   
 *   // Get latest chain execution
 *   const latest = hook.getLatestChain();
 *   console.log('Latest chain:', latest);
 *   
 *   // Get all middleware executions
 *   const executions = hook.getMiddlewareExecutions();
 *   console.log('All executions:', executions);
 * }
 * ```
 */
export interface NgxsmkGatekeeperDebugHook {
  /**
   * Get all chain execution records
   */
  getChains(): ChainExecutionRecord[];

  /**
   * Get all middleware execution records
   */
  getMiddlewareExecutions(): MiddlewareExecutionRecord[];

  /**
   * Get the latest chain execution
   */
  getLatestChain(): ChainExecutionRecord | null;

  /**
   * Clear all execution records
   */
  clear(): void;

  /**
   * Get execution statistics
   */
  getStats(): {
    totalChains: number;
    totalMiddlewareExecutions: number;
    passedChains: number;
    failedChains: number;
    averageChainDuration: number;
    averageMiddlewareDuration: number;
  };
}

/**
 * Storage for execution records
 */
class ExecutionStore {
  private chains: ChainExecutionRecord[] = [];
  private middlewareExecutions: MiddlewareExecutionRecord[] = [];
  private readonly maxRecords = 100; // Limit to prevent memory issues

  addChain(chain: ChainExecutionRecord): void {
    this.chains.push(chain);
    if (this.chains.length > this.maxRecords) {
      this.chains.shift(); // Remove oldest
    }
  }

  addMiddlewareExecution(execution: MiddlewareExecutionRecord): void {
    this.middlewareExecutions.push(execution);
    if (this.middlewareExecutions.length > this.maxRecords) {
      this.middlewareExecutions.shift(); // Remove oldest
    }
  }

  getChains(): ChainExecutionRecord[] {
    return [...this.chains];
  }

  getMiddlewareExecutions(): MiddlewareExecutionRecord[] {
    return [...this.middlewareExecutions];
  }

  getLatestChain(): ChainExecutionRecord | null {
    return this.chains.length > 0 ? (this.chains[this.chains.length - 1] ?? null) : null;
  }

  clear(): void {
    this.chains = [];
    this.middlewareExecutions = [];
  }

  getStats() {
    const totalChains = this.chains.length;
    const totalMiddlewareExecutions = this.middlewareExecutions.length;
    const passedChains = this.chains.filter(c => c.result).length;
    const failedChains = totalChains - passedChains;

    const averageChainDuration = totalChains > 0
      ? this.chains.reduce((sum, c) => sum + c.totalDuration, 0) / totalChains
      : 0;

    const averageMiddlewareDuration = totalMiddlewareExecutions > 0
      ? this.middlewareExecutions.reduce((sum, m) => sum + m.duration, 0) / totalMiddlewareExecutions
      : 0;

    return {
      totalChains,
      totalMiddlewareExecutions,
      passedChains,
      failedChains,
      averageChainDuration,
      averageMiddlewareDuration,
    };
  }
}

const store = new ExecutionStore();

/**
 * Checks if we're in development mode
 */
function isDevelopment(): boolean {
  // Check for common development indicators
  if (typeof process !== 'undefined' && process.env) {
    return process.env['NODE_ENV'] !== 'production';
  }
  return true;
}

/**
 * Gets middleware name for debugging
 */
function getMiddlewareName(
  middleware: NgxMiddleware,
  index: number
): string {
  if (middleware && typeof middleware === 'function') {
    const namedMiddleware = middleware as { middlewareName?: string };
    if (namedMiddleware.middlewareName) {
      return namedMiddleware.middlewareName;
    }
  }
  return `Middleware[${index}]`;
}

/**
 * Creates the global debug hook object
 */
function createDebugHook(): NgxsmkGatekeeperDebugHook {
  return {
    getChains: () => store.getChains(),
    getMiddlewareExecutions: () => store.getMiddlewareExecutions(),
    getLatestChain: () => store.getLatestChain(),
    clear: () => store.clear(),
    getStats: () => store.getStats(),
  };
}

/**
 * Attaches the global debug hook to window (dev mode only)
 * 
 * @experimental This API is experimental and may change in future versions.
 */
export function attachDebugHook(): void {
  // Only attach in development mode and browser environment
  if (!isDevelopment()) {
    return;
  }

  if (typeof window === 'undefined') {
    return;
  }

  // Attach to window
  const globalWindow = window as unknown as {
    __NGXSMK_GATEKEEPER__?: NgxsmkGatekeeperDebugHook;
  };

  if (!globalWindow.__NGXSMK_GATEKEEPER__) {
    globalWindow.__NGXSMK_GATEKEEPER__ = createDebugHook();
  }
}

/**
 * Records middleware execution for debug hook
 */
export function recordMiddlewareExecution(
  options: DebugOptions,
  middleware: NgxMiddleware,
  index: number,
  startTime: number,
  endTime: number,
  result: boolean,
  error?: unknown
): void {
  if (!isDevelopment() || typeof window === 'undefined') {
    return;
  }

  const execution: MiddlewareExecutionRecord = {
    id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: startTime,
    middlewareName: getMiddlewareName(middleware, index),
    middlewareIndex: index,
    contextType: options.contextType,
    ...(options.contextPath !== undefined && { contextPath: options.contextPath }),
    ...(options.chunkName !== undefined && { chunkName: options.chunkName }),
    result,
    duration: endTime - startTime,
    ...(error !== undefined && { error: String(error) }),
    sanitizedContext: sanitizeContext(options.context),
  };

  store.addMiddlewareExecution(execution);
}

/**
 * Records chain execution for debug hook
 */
export function recordChainExecution(
  options: DebugOptions,
  result: MiddlewareResult,
  totalDuration: number,
  middlewareExecutions: MiddlewareExecutionRecord[]
): void {
  if (!isDevelopment() || typeof window === 'undefined') {
    return;
  }

  const recentExecutions = store.getMiddlewareExecutions().slice(-middlewareExecutions.length || -10);

  const chain: ChainExecutionRecord = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    contextType: options.contextType,
    ...(options.contextPath !== undefined && { contextPath: options.contextPath }),
    ...(options.chunkName !== undefined && { chunkName: options.chunkName }),
    middlewareCount: recentExecutions.length,
    result: result.result,
    stoppedAt: result.stoppedAt,
    totalDuration,
    ...(result.redirect !== undefined && { redirect: result.redirect }),
    middlewareExecutions: recentExecutions,
  };

  store.addChain(chain);
}

