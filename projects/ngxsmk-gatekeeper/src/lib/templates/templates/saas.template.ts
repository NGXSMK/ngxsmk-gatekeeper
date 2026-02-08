/**
 * SaaS (Software as a Service) template
 * 
 * Ideal for multi-tenant SaaS applications with:
 * - User authentication
 * - Role-based access control
 * - Subscription/plan checks
 * - Rate limiting
 * - Analytics
 */

import { Template, TemplateCategory } from '../template.types';
import { GatekeeperConfig } from '../../angular/gatekeeper.config';
import {
  createAuthMiddleware,
  createRoleMiddleware,
  createRateLimitMiddleware,
  createAnalyticsMiddleware,
} from '../../middlewares';
import { createMiddleware } from '../../helpers';

export interface SaaSTemplateOptions {
  /**
   * Authentication path in context
   */
  authPath?: string;
  /**
   * Required roles
   */
  roles?: string[];
  /**
   * Subscription/plan check enabled
   */
  checkSubscription?: boolean;
  /**
   * Rate limiting enabled
   */
  enableRateLimit?: boolean;
  /**
   * Analytics enabled
   */
  enableAnalytics?: boolean;
  /**
   * Redirect path on failure
   */
  onFail?: string;
}

export function createSaaSTemplate(): Template {
  return {
    metadata: {
      id: 'saas',
      name: 'SaaS Application',
      description: 'Complete template for multi-tenant SaaS applications with authentication, roles, rate limiting, and analytics',
      category: TemplateCategory.SaaS,
      tags: ['saas', 'multi-tenant', 'subscription', 'enterprise'],
      version: '1.1.0',
      examples: [
        'Multi-tenant SaaS platforms',
        'Subscription-based applications',
        'Enterprise software',
      ],
    },
    factory: async (options: SaaSTemplateOptions = {}) => {
      const {
        authPath = 'user.isAuthenticated',
        roles = ['user'],
        checkSubscription = false,
        enableRateLimit = true,
        enableAnalytics = true,
        onFail = '/login',
      } = options;

      const middlewares: any[] = [];

      // Authentication
      middlewares.push(createAuthMiddleware({ authPath }));

      // Role-based access
      if (roles.length > 0) {
        middlewares.push(createRoleMiddleware({ roles, mode: 'any' }));
      }

      // Subscription check (if enabled)
      if (checkSubscription) {
        middlewares.push(
          createMiddleware('subscription', (context) => {
            // Check subscription status
            const user = context['user'] as any;
            return user?.subscription?.active === true;
          })
        );
      }

      // Rate limiting
      if (enableRateLimit) {
        middlewares.push(
          createRateLimitMiddleware({
            maxRequests: 100,
            windowMs: 60000, // 1 minute
          })
        );
      }

      // Analytics
      if (enableAnalytics) {
        middlewares.push(
          createAnalyticsMiddleware({
            sink: {
              track: async (event) => {
                // Implement your analytics tracking
                console.log('[Analytics]', event);
              },
            },
          })
        );
      }

      return {
        middlewares,
        onFail,
        debug: false,
        benchmark: {
          enabled: true,
          middlewareThreshold: 50,
          chainThreshold: 200,
        },
      } as GatekeeperConfig;
    },
  };
}

