/**
 * Compliance template
 * 
 * For SOC2, ISO 27001, and similar compliance requirements:
 * - Deterministic execution
 * - Complete audit trails
 * - Structured logging
 * - Execution traces
 * - Decision rationale
 */

import { Template, TemplateCategory } from '../template.types';
import { GatekeeperConfig } from '../../angular/gatekeeper.config';
import {
  createAuthMiddleware,
  createRoleMiddleware,
  createRequestLoggingMiddleware,
} from '../../middlewares';

export interface ComplianceTemplateOptions {
  /**
   * Authentication path
   */
  authPath?: string;
  /**
   * Required roles
   */
  roles?: string[];
  /**
   * Log format
   */
  logFormat?: 'json' | 'text' | 'pretty';
  /**
   * Log retention days
   */
  logRetentionDays?: number;
  /**
   * Compliance policy identifier
   */
  compliancePolicy?: string;
  /**
   * Redirect path on failure
   */
  onFail?: string;
}

export function createComplianceTemplate(): Template {
  return {
    metadata: {
      id: 'compliance',
      name: 'Compliance Ready',
      description: 'Template configured for SOC2, ISO 27001, and similar compliance frameworks',
      category: TemplateCategory.Compliance,
      tags: ['compliance', 'soc2', 'iso27001', 'audit', 'enterprise'],
      version: '1.1.0',
      examples: [
        'SOC2 compliance',
        'ISO 27001 compliance',
        'HIPAA compliance',
        'GDPR compliance',
      ],
    },
    factory: async (options: ComplianceTemplateOptions = {}) => {
      const {
        authPath = 'user.isAuthenticated',
        roles = [],
        logFormat = 'json',
        logRetentionDays = 90,
        compliancePolicy = 'SOC2-CC6.1',
        onFail = '/unauthorized',
      } = options;

      const middlewares: any[] = [];

      // Authentication
      middlewares.push(createAuthMiddleware({ authPath }));

      // Role-based access
      if (roles.length > 0) {
        middlewares.push(createRoleMiddleware({ roles, mode: 'any' }));
      }

      // Request logging
      middlewares.push(
        createRequestLoggingMiddleware({
          logLevel: 'info',
          format: logFormat,
        })
      );

      return {
        middlewares,
        onFail,
        debug: false,
        audit: {
          sinks: {
            log: async (entry) => {
              // Compliance audit logging
              console.log('[Compliance Audit]', entry);
            },
          },
        },
        compliance: {
          enabled: true,
          logFormat,
          includeExecutionTrace: true,
          includeDecisionRationale: true,
          logRetention: {
            days: logRetentionDays,
            policy: compliancePolicy,
          },
        },
      } as GatekeeperConfig;
    },
  };
}

