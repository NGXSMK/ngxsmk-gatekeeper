/**
 * Template loader utilities
 */

import { TemplateRegistry } from './template.registry';
import { Template, TemplateCategory } from './template.types';
import { GatekeeperConfig } from '../angular/gatekeeper.config';

/**
 * Loads all built-in templates into registry
 *
 * @param registry - Template registry
 */
export async function loadBuiltInTemplates(registry: TemplateRegistry): Promise<void> {
  // Import templates dynamically to enable tree-shaking
  const [
    basicModule,
    saasModule,
    ecommerceModule,
    apiModule,
    securityModule,
    complianceModule,
    authPresetModule,
    adminPresetModule,
  ] = await Promise.all([
    import('./templates/basic.template'),
    import('./templates/saas.template'),
    import('./templates/ecommerce.template'),
    import('./templates/api.template'),
    import('./templates/security.template'),
    import('./templates/compliance.template'),
    import('../presets/auth.preset'),
    import('../presets/admin.preset'),
  ]);

  // Register templates
  registry.register(basicModule.createBasicTemplate());
  registry.register(saasModule.createSaaSTemplate());
  registry.register(ecommerceModule.createECommerceTemplate());
  registry.register(apiModule.createAPITemplate());
  registry.register(securityModule.createSecurityTemplate());
  registry.register(complianceModule.createComplianceTemplate());

  // Register presets as templates
  registry.register({
    metadata: {
      id: 'preset-auth',
      name: 'Authentication Preset',
      description: 'Authentication middleware preset',
      category: TemplateCategory.Basic,
      version: '1.1.0',
    },
    factory: async (options) => {
      const preset = authPresetModule.authPreset(options as any);
      return {
        middlewares: [preset],
        onFail: (options as any)?.onFail || '/login',
      } as GatekeeperConfig;
    },
  });

  registry.register({
    metadata: {
      id: 'preset-admin',
      name: 'Admin Preset',
      description: 'Admin access preset with authentication and role checks',
      category: TemplateCategory.Admin,
      version: '1.1.0',
    },
    factory: async (options) => {
      const preset = adminPresetModule.adminPreset(options as any);
      return {
        middlewares: [preset],
        onFail: (options as any)?.onFail || '/unauthorized',
      } as GatekeeperConfig;
    },
  });
}

/**
 * Quick access functions for common templates
 */
export class TemplateLoader {
  private registry: TemplateRegistry;
  private loaded = false;

  constructor(registry: TemplateRegistry) {
    this.registry = registry;
  }

  /**
   * Ensures templates are loaded
   */
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await loadBuiltInTemplates(this.registry);
      this.loaded = true;
    }
  }

  /**
   * Gets a template by ID
   */
  async getTemplate(id: string): Promise<Template | null> {
    await this.ensureLoaded();
    return this.registry.get(id);
  }

  /**
   * Creates configuration from template
   */
  async createConfig(
    id: string,
    options?: Record<string, unknown>
  ): Promise<GatekeeperConfig | null> {
    await this.ensureLoaded();
    return this.registry.createConfig(id, options);
  }

  /**
   * Gets all templates
   */
  async getAllTemplates(): Promise<Template[]> {
    await this.ensureLoaded();
    return this.registry.getAll();
  }

  /**
   * Gets templates by category
   */
  async getByCategory(category: TemplateCategory): Promise<Template[]> {
    await this.ensureLoaded();
    return this.registry.getByCategory(category);
  }

  /**
   * Searches templates
   */
  async search(query: string): Promise<Template[]> {
    await this.ensureLoaded();
    return this.registry.search(query);
  }
}

/**
 * Creates a template loader instance
 */
export function createTemplateLoader(): TemplateLoader {
  const registry = new TemplateRegistry();
  return new TemplateLoader(registry);
}

