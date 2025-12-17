/**
 * Extension registry for managing plugins
 * 
 * This registry is internal to the core and manages extension registration.
 * Plugins register themselves via the extension API, but the core doesn't
 * know what they do - it only manages their middleware.
 */

import { Injectable, inject } from '@angular/core';
import { GatekeeperExtension, ExtensionContext, ExtensionRegistration } from './extension.types';
import { NgxMiddleware } from '../core';
import { MiddlewarePipeline } from '../helpers';
import { GATEKEEPER_CONFIG } from '../angular/gatekeeper.provider';
import { GatekeeperConfig } from '../angular/gatekeeper.config';

/**
 * Extension registry service
 * 
 * Manages extension registration and provides access to registered middleware.
 * This service is internal to the core and has no knowledge of what extensions do.
 */
@Injectable({
  providedIn: 'root',
})
export class ExtensionRegistry {
  private readonly extensions = new Map<string, GatekeeperExtension>();
  private readonly registrations = new Map<string, ExtensionRegistration>();
  private preMiddleware: (NgxMiddleware | MiddlewarePipeline)[] = [];
  private postMiddleware: (NgxMiddleware | MiddlewarePipeline)[] = [];
  private mergedMiddleware: (NgxMiddleware | MiddlewarePipeline)[] = [];

  /**
   * Registers an extension
   * 
   * @param extension - Extension to register
   * @returns Registration result
   */
  async register(extension: GatekeeperExtension): Promise<ExtensionRegistration> {
    if (this.extensions.has(extension.id)) {
      return {
        extension,
        success: false,
        error: `Extension with id "${extension.id}" is already registered`,
        registeredMiddleware: [],
      };
    }

    try {
      // Create extension context
      const context = this.createExtensionContext();
      
      // Initialize extension
      const middleware = await extension.initialize(context);
      const middlewareArray = Array.isArray(middleware) ? middleware : [];

      // Store extension
      this.extensions.set(extension.id, extension);

      // Store registration
      const registration: ExtensionRegistration = {
        extension,
        success: true,
        registeredMiddleware: middlewareArray,
      };
      this.registrations.set(extension.id, registration);

      return registration;
    } catch (error) {
      return {
        extension,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        registeredMiddleware: [],
      };
    }
  }

  /**
   * Unregisters an extension
   */
  async unregister(extensionId: string): Promise<boolean> {
    const extension = this.extensions.get(extensionId);
    if (!extension) {
      return false;
    }

    try {
      // Call destroy if available
      if (extension.destroy) {
        await extension.destroy();
      }

      // Remove from registry
      this.extensions.delete(extensionId);
      this.registrations.delete(extensionId);

      this.preMiddleware = [];
      this.postMiddleware = [];
      this.mergedMiddleware = [];

      return true;
    } catch (error) {
      console.error(`[ExtensionRegistry] Error unregistering extension "${extensionId}":`, error);
      return false;
    }
  }

  /**
   * Gets all registered extensions
   */
  getExtensions(): GatekeeperExtension[] {
    return Array.from(this.extensions.values());
  }

  /**
   * Gets registration for an extension
   */
  getRegistration(extensionId: string): ExtensionRegistration | undefined {
    return this.registrations.get(extensionId);
  }

  /**
   * Gets all pre-middleware registered by extensions
   */
  getPreMiddleware(): (NgxMiddleware | MiddlewarePipeline)[] {
    return [...this.preMiddleware];
  }

  /**
   * Gets all post-middleware registered by extensions
   */
  getPostMiddleware(): (NgxMiddleware | MiddlewarePipeline)[] {
    return [...this.postMiddleware];
  }

  /**
   * Gets all merged middleware registered by extensions
   */
  getMergedMiddleware(): (NgxMiddleware | MiddlewarePipeline)[] {
    return [...this.mergedMiddleware];
  }

  /**
   * Creates an extension context for plugin initialization
   */
  private createExtensionContext(): ExtensionContext {
    let config: GatekeeperConfig | undefined;
    try {
      config = inject(GATEKEEPER_CONFIG, { optional: true }) ?? undefined;
    } catch {
      // Not in injection context - config will be undefined
    }

    return {
      getConfig: <T = unknown>(key: string): T | undefined => {
        if (!config) return undefined;
        return (config as unknown as Record<string, unknown>)[key] as T | undefined;
      },
      getFullConfig: (): Record<string, unknown> => {
        return config ? { ...config } : {};
      },
      registerPreMiddleware: (...middlewares: (NgxMiddleware | MiddlewarePipeline)[]): void => {
        this.preMiddleware.push(...middlewares);
      },
      registerPostMiddleware: (...middlewares: (NgxMiddleware | MiddlewarePipeline)[]): void => {
        this.postMiddleware.push(...middlewares);
      },
      registerMiddleware: (...middlewares: (NgxMiddleware | MiddlewarePipeline)[]): void => {
        this.mergedMiddleware.push(...middlewares);
      },
    };
  }
}

