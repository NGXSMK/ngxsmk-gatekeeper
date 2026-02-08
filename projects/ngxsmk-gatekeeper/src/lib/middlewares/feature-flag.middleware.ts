import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';
import { FeatureFlagProvider } from '../providers/feature-flag.provider';

/**
 * Configuration options for feature flag middleware
 */
export interface FeatureFlagMiddlewareOptions {
  /**
   * Name of the feature flag to check
   */
  flagName: string;
  /**
   * Optional feature flag provider
   * If provided, will be used to resolve the flag asynchronously
   * If not provided, falls back to context-based lookup
   */
  provider?: FeatureFlagProvider;
  /**
   * Path to the feature flags object in the context
   * Default: 'featureFlags'
   * 
   * Only used if no FeatureFlagProvider is provided
   */
  flagsPath?: string;
  /**
   * If true, flag must be explicitly true (not just truthy)
   * Default: true
   * 
   * Only used if no FeatureFlagProvider is provided
   */
  strict?: boolean;
  /**
   * Optional redirect path when feature flag is disabled
   */
  redirect?: string;
}



/**
 * Creates a feature flag middleware that checks if a feature flag is enabled
 * 
 * Supports both provider-based (async) and context-based flag resolution.
 * Priority:
 * 1. Provider passed in options
 * 2. Provider from context.featureFlagProvider
 * 3. Context-based lookup (flagsPath)
 *
 * @param options - Configuration options for the middleware
 * @returns A middleware function that checks feature flag status
 *
 * @example
 * ```typescript
 * // Using context-based flags (no provider)
 * const dashboardMiddleware = createFeatureFlagMiddleware({
 *   flagName: 'newDashboard',
 *   flagsPath: 'featureFlags'
 * });
 *
 * // Using provider directly
 * const provider = inject(FeatureFlagProvider);
 * const betaMiddleware = createFeatureFlagMiddleware({
 *   flagName: 'betaFeatures',
 *   provider,
 *   redirect: '/upgrade'
 * });
 *
 * // Provider can also be passed through context (from guard/interceptor)
 * // The guard/interceptor injects the provider and adds it to context
 * ```
 */
export function createFeatureFlagMiddleware(
  options: FeatureFlagMiddlewareOptions
): ReturnType<typeof createMiddleware> {
  const {
    flagName,
    provider,
    flagsPath = 'featureFlags',
    strict = true,
    redirect,
  } = options;

  return createMiddleware('feature-flag', async (context: MiddlewareContext) => {
    // Priority 1: Provider from options
    // Priority 2: Provider from context (injected by guard/interceptor)
    const activeProvider = provider || (context['featureFlagProvider'] as FeatureFlagProvider | undefined);

    if (activeProvider) {
      // Use provider to check flag asynchronously
      try {
        const enabled = await activeProvider.isEnabled(
          flagName,
          context as Record<string, unknown>
        );

        if (!enabled) {
          if (redirect) {
            return {
              allow: false,
              redirect,
            };
          }
          return false;
        }

        return true;
      } catch (error) {
        console.error(`Feature flag provider error for "${flagName}":`, error);
        // Fall through to context-based lookup on error
      }
    }

    // Fallback: Get feature flags object from context
    const flags = getValueByPath(context, flagsPath);
    if (flags == null || typeof flags !== 'object') {
      if (redirect) {
        return {
          allow: false,
          redirect,
        };
      }
      return false;
    }

    // Get the specific flag value
    const flagValue = (flags as Record<string, unknown>)[flagName];

    let enabled: boolean;
    if (strict) {
      // Flag must be explicitly true
      enabled = flagValue === true;
    } else {
      // Flag must be truthy
      enabled = Boolean(flagValue);
    }

    if (!enabled && redirect) {
      return {
        allow: false,
        redirect,
      };
    }

    return enabled;
  });
}

