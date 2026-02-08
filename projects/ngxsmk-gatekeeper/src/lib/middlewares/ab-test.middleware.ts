import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';

/**
 * A/B test variant
 */
export interface ABTestVariant {
  name: string;
  weight: number; // Percentage (0-100)
}

/**
 * A/B test configuration
 */
export interface ABTest {
  variants: ABTestVariant[];
  persist?: boolean; // Persist variant for user
  storageKey?: string; // Storage key for persistence
}

/**
 * Configuration options for A/B testing middleware
 */
export interface ABTestMiddlewareOptions {
  /**
   * A/B tests configuration
   * Key is test name, value is test configuration
   */
  tests: Record<string, ABTest>;
  /**
   * Function to get user identifier for persistence
   * Default: 'user.id'
   */
  userIdPath?: string;
  /**
   * Custom storage for test assignments (optional)
   */
  storage?: {
    get: (key: string) => string | undefined | Promise<string | undefined>;
    set: (key: string, value: string) => void | Promise<void>;
  };
  /**
   * Middleware to execute based on variant
   * Key is test name, value is object mapping variants to middleware
   */
  variantMiddleware?: Record<string, Record<string, ReturnType<typeof createMiddleware>>>;
}



/**
 * Selects a variant based on weights
 */
function selectVariant(variants: ABTestVariant[]): string {
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  let random = Math.random() * totalWeight;

  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) {
      return variant.name;
    }
  }

  // Fallback to first variant
  return variants[0]?.name || 'A';
}

/**
 * Creates middleware that implements A/B testing
 *
 * @param options - Configuration options
 * @returns Middleware function
 *
 * @example
 * ```typescript
 * const abTestMiddleware = createABTestMiddleware({
 *   tests: {
 *     'new-dashboard': {
 *       variants: [
 *         { name: 'A', weight: 50 },
 *         { name: 'B', weight: 50 }
 *       ],
 *       persist: true
 *     }
 *   }
 * });
 * ```
 */
export function createABTestMiddleware(
  options: ABTestMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    tests,
    userIdPath = 'user.id',
    storage,
    variantMiddleware,
  } = options;

  const getStoredVariant = async (key: string): Promise<string | undefined> => {
    if (storage) {
      return await storage.get(key);
    }
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(key) || undefined;
    }
    return undefined;
  };

  const setStoredVariant = async (key: string, variant: string): Promise<void> => {
    if (storage) {
      await storage.set(key, variant);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, variant);
    }
  };

  return createMiddleware('ab-test', (async (context: MiddlewareContext) => {
    // Assign variants for each test
    for (const [testName, testConfig] of Object.entries(tests)) {
      let variant: string;

      // Check if variant is already assigned (persistence)
      if (testConfig.persist) {
        const userId = getValueByPath(context, userIdPath);
        const storageKey = testConfig.storageKey || `ab-test:${testName}:${userId || 'anonymous'}`;
        const storedVariant = await getStoredVariant(storageKey);

        if (storedVariant) {
          variant = storedVariant;
        } else {
          // Assign new variant
          variant = selectVariant(testConfig.variants);
          await setStoredVariant(storageKey, variant);
        }
      } else {
        variant = selectVariant(testConfig.variants);
      }

      // Store variant in context
      if (!context['abTests']) {
        context['abTests'] = {};
      }
      (context['abTests'] as Record<string, string>)[testName] = variant;

      // Execute variant-specific middleware if provided
      if (variantMiddleware && variantMiddleware[testName] && variantMiddleware[testName][variant]) {
        const middleware = variantMiddleware[testName][variant];
        if (middleware) {
          const result = await Promise.resolve(middleware(context));
          const resultValue = typeof result === 'object' && 'allow' in result ? result.allow : result;
          if (resultValue === false) {
            return result;
          }
        }
      }
    }

    return true;
  }) as any);
}

