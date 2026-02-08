/**
 * Basic template
 * 
 * Simple template for basic applications:
 * - Authentication only
 * - Minimal configuration
 */

import { Template, TemplateCategory } from '../template.types';
import { GatekeeperConfig } from '../../angular/gatekeeper.config';
import { createAuthMiddleware } from '../../middlewares';

export interface BasicTemplateOptions {
  /**
   * Authentication path
   */
  authPath?: string;
  /**
   * Redirect path on failure
   */
  onFail?: string;
  /**
   * Enable debug mode
   */
  debug?: boolean;
}

export function createBasicTemplate(): Template {
  return {
    metadata: {
      id: 'basic',
      name: 'Basic Authentication',
      description: 'Simple template with authentication only - perfect for getting started',
      category: TemplateCategory.Basic,
      tags: ['basic', 'simple', 'starter', 'auth'],
      version: '1.1.0',
      examples: [
        'Simple applications',
        'Getting started',
        'Prototyping',
      ],
    },
    factory: async (options: BasicTemplateOptions = {}) => {
      const {
        authPath = 'user.isAuthenticated',
        onFail = '/login',
        debug = false,
      } = options;

      return {
        middlewares: [
          createAuthMiddleware({ authPath }),
        ],
        onFail,
        debug,
      } as GatekeeperConfig;
    },
  };
}

