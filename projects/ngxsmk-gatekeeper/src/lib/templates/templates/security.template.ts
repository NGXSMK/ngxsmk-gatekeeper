/**
 * Security-focused template
 * 
 * Maximum security configuration with:
 * - Authentication
 * - CSRF protection
 * - IP filtering
 * - Rate limiting
 * - Account lockout
 * - Session management
 * - Audit logging
 */

import { Template, TemplateCategory } from '../template.types';
import { GatekeeperConfig } from '../../angular/gatekeeper.config';
import {
  createAuthMiddleware,
  createCSRFMiddleware,
  createIPWhitelistMiddleware,
  createRateLimitMiddleware,
  createAccountLockoutMiddleware,
  createSessionMiddleware,
} from '../../middlewares';

export interface SecurityTemplateOptions {
  /**
   * Authentication path
   */
  authPath?: string;
  /**
   * Allowed IP addresses or CIDR ranges
   */
  allowedIPs?: string[];
  /**
   * Rate limit configuration
   */
  rateLimit?: {
    maxRequests: number;
    windowMs: number;
  };
  /**
   * Account lockout configuration
   */
  accountLockout?: {
    maxAttempts: number;
    lockoutDuration: number;
  };
  /**
   * Session timeout in seconds
   */
  sessionTimeout?: number;
  /**
   * Redirect path on failure
   */
  onFail?: string;
}

export function createSecurityTemplate(): Template {
  return {
    metadata: {
      id: 'security',
      name: 'Maximum Security',
      description: 'High-security template with multiple layers of protection',
      category: TemplateCategory.Security,
      tags: ['security', 'enterprise', 'compliance', 'audit'],
      version: '1.1.0',
      examples: [
        'Financial applications',
        'Healthcare systems',
        'Government applications',
        'High-security enterprise',
      ],
    },
    factory: async (options: SecurityTemplateOptions = {}) => {
      const {
        authPath = 'user.isAuthenticated',
        allowedIPs = [],
        rateLimit = {
          maxRequests: 50,
          windowMs: 60000,
        },
        accountLockout = {
          maxAttempts: 5,
          lockoutDuration: 900000, // 15 minutes
        },
        sessionTimeout = 1800, // 30 minutes
        onFail = '/unauthorized',
      } = options;

      const middlewares: any[] = [];

      // IP filtering (first - fastest check)
      if (allowedIPs.length > 0) {
        middlewares.push(
          createIPWhitelistMiddleware({
            allowedIPs,
          })
        );
      }

      // Rate limiting
      middlewares.push(
        createRateLimitMiddleware({
          maxRequests: rateLimit.maxRequests,
          windowMs: rateLimit.windowMs,
        })
      );

      // Account lockout
      middlewares.push(
        createAccountLockoutMiddleware({
          maxAttempts: accountLockout.maxAttempts,
          lockoutDuration: accountLockout.lockoutDuration,
        })
      );

      // CSRF protection
      middlewares.push(
        createCSRFMiddleware({
          tokenHeader: 'X-CSRF-Token',
          protectedMethods: ['POST', 'PUT', 'DELETE', 'PATCH'],
        })
      );

      // Authentication
      middlewares.push(createAuthMiddleware({ authPath }));

      // Session management
      middlewares.push(
        createSessionMiddleware({
          timeout: sessionTimeout,
          extendOnActivity: true,
        })
      );

      return {
        middlewares,
        onFail,
        debug: false,
        zeroTrust: true,
        audit: {
          sinks: {
            log: async (entry) => {
              // Comprehensive audit logging
              console.log('[Security Audit]', entry);
            },
          },
        },
        compliance: {
          enabled: true,
          logFormat: 'json',
          includeExecutionTrace: true,
          includeDecisionRationale: true,
        },
      } as GatekeeperConfig;
    },
  };
}

