/**
 * E-commerce template
 * 
 * Ideal for e-commerce applications with:
 * - Customer authentication
 * - Payment protection
 * - Cart security
 * - CSRF protection
 * - Session management
 */

import { Template, TemplateCategory } from '../template.types';
import { GatekeeperConfig } from '../../angular/gatekeeper.config';
import {
  createAuthMiddleware,
  createCSRFMiddleware,
  createSessionMiddleware,
  createRateLimitMiddleware,
} from '../../middlewares';

export interface ECommerceTemplateOptions {
  /**
   * Authentication path
   */
  authPath?: string;
  /**
   * Enable CSRF protection
   */
  enableCSRF?: boolean;
  /**
   * Enable session management
   */
  enableSession?: boolean;
  /**
   * Enable rate limiting
   */
  enableRateLimit?: boolean;
  /**
   * Redirect path on failure
   */
  onFail?: string;
}

export function createECommerceTemplate(): Template {
  return {
    metadata: {
      id: 'ecommerce',
      name: 'E-commerce Application',
      description: 'Template for e-commerce applications with payment protection, CSRF, and session management',
      category: TemplateCategory.ECommerce,
      tags: ['ecommerce', 'payment', 'cart', 'security'],
      version: '1.1.0',
      examples: [
        'Online stores',
        'Shopping carts',
        'Payment processing',
      ],
    },
    factory: async (options: ECommerceTemplateOptions = {}) => {
      const {
        authPath = 'user.isAuthenticated',
        enableCSRF = true,
        enableSession = true,
        enableRateLimit = true,
        onFail = '/login',
      } = options;

      const middlewares: any[] = [];

      // CSRF protection (should be first)
      if (enableCSRF) {
        middlewares.push(
          createCSRFMiddleware({
            tokenHeader: 'X-CSRF-Token',
            protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
          })
        );
      }

      // Authentication
      middlewares.push(createAuthMiddleware({ authPath }));

      // Session management
      if (enableSession) {
        middlewares.push(
          createSessionMiddleware({
            timeout: 3600, // 1 hour
            extendOnActivity: true,
          })
        );
      }

      // Rate limiting
      if (enableRateLimit) {
        middlewares.push(
          createRateLimitMiddleware({
            maxRequests: 200,
            windowMs: 60000, // 1 minute
          })
        );
      }

      return {
        middlewares,
        onFail,
        debug: false,
        audit: {
          sinks: {
            log: async (entry) => {
              // Log payment and cart operations
              console.log('[Audit]', entry);
            },
          },
        },
      } as GatekeeperConfig;
    },
  };
}

