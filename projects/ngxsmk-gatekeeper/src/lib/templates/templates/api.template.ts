/**
 * API template
 * 
 * Ideal for API endpoints with:
 * - API key authentication
 * - Rate limiting
 * - Request validation
 * - Request logging
 */

import { Template, TemplateCategory } from '../template.types';
import { GatekeeperConfig } from '../../angular/gatekeeper.config';
import {
  createAPIKeyMiddleware,
  createRateLimitMiddleware,
  createRequestValidationMiddleware,
  createRequestLoggingMiddleware,
} from '../../middlewares';

export interface APITemplateOptions {
  /**
   * API key validation function
   */
  validateAPIKey?: (key: string) => Promise<boolean> | boolean;
  /**
   * Rate limit configuration
   */
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  /**
   * Enable request validation
   */
  enableValidation?: boolean;
  /**
   * Enable request logging
   */
  enableLogging?: boolean;
  /**
   * Redirect path on failure
   */
  onFail?: string;
}

export function createAPITemplate(): Template {
  return {
    metadata: {
      id: 'api',
      name: 'API Endpoints',
      description: 'Template for protecting API endpoints with API keys, rate limiting, and request validation',
      category: TemplateCategory.API,
      tags: ['api', 'rest', 'graphql', 'endpoints'],
      version: '1.1.0',
      examples: [
        'REST APIs',
        'GraphQL endpoints',
        'Microservices',
      ],
    },
    factory: async (options: APITemplateOptions = {}) => {
      const {
        validateAPIKey = async (key: string) => {
          // Default: validate against environment variable
          return key === process.env?.['API_KEY'];
        },
        rateLimit = {
          maxRequests: 1000,
          windowMs: 60000, // 1 minute
        },
        enableValidation = true,
        enableLogging = true,
        onFail = '/api/unauthorized',
      } = options;

      const middlewares: any[] = [];

      // API key validation
      middlewares.push(
        createAPIKeyMiddleware({
          validateKey: validateAPIKey,
          headerName: 'X-API-Key',
        })
      );

      // Rate limiting
      middlewares.push(
        createRateLimitMiddleware({
          maxRequests: rateLimit.maxRequests,
          windowMs: rateLimit.windowMs,
        })
      );

      // Request validation
      if (enableValidation) {
        middlewares.push(
          createRequestValidationMiddleware({
            // Add validation schemas as needed
          })
        );
      }

      // Request logging
      if (enableLogging) {
        middlewares.push(
          createRequestLoggingMiddleware({
            logLevel: 'info',
            format: 'json',
          })
        );
      }

      return {
        middlewares,
        onFail,
        debug: false,
        benchmark: {
          enabled: true,
          middlewareThreshold: 100,
          chainThreshold: 500,
        },
      } as GatekeeperConfig;
    },
  };
}

