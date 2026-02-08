# Plugin Architecture

## Overview

ngxsmk-gatekeeper uses a plugin architecture that allows third-party extensions to register middleware without the core having any knowledge of the plugin's implementation. All plugins are open source and free to use.

## Core Principles

1. **Core remains open source**: The core library is fully open source with all features included.
2. **Plugins are separate packages**: Plugins are distributed as separate npm packages (all open source).
3. **Extension API**: Plugins register middleware via the extension API, which is part of the open-source core.
4. **No core dependencies on plugins**: The core doesn't import or depend on any plugin code.

## Architecture

```
┌─────────────────────────────────────────┐
│         Core (Open Source)              │
│  ┌───────────────────────────────────┐  │
│  │    Extension API (Public)         │  │
│  │  - GatekeeperExtension interface  │  │
│  │  - ExtensionRegistry               │  │
│  │  - provideExtensions()             │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │    Middleware Runner (Internal)   │  │
│  │  - Merges extension middleware    │  │
│  │  - Executes in order              │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ▲
              │ Registers via Extension API
              │
┌─────────────┴─────────────┐
│   Plugin (Separate Pkg)   │
│  - Implements Extension   │
│  - Provides Middleware    │
│  - No core dependencies   │
└───────────────────────────┘
```

## Creating a Plugin

### 1. Create Plugin Package

```bash
npm init -y
npm install ngxsmk-gatekeeper
```

### 2. Implement Extension Interface

```typescript
// src/plugin.ts
import { GatekeeperExtension, ExtensionContext } from 'ngxsmk-gatekeeper/lib/extensions';
import { NgxMiddleware } from 'ngxsmk-gatekeeper';
import { createMiddleware } from 'ngxsmk-gatekeeper/lib/helpers';

export class AuthPlugin implements GatekeeperExtension {
  readonly id = 'ngxsmk-gatekeeper-plugin-auth';
  readonly name = 'Authentication Plugin';
  readonly version = '1.1.0';
  readonly description = 'Advanced authentication with MFA support';

  constructor(private config: { apiKey: string; mfaRequired?: boolean }) {}

  async initialize(context: ExtensionContext): Promise<NgxMiddleware[]> {
    // Read configuration from gatekeeper config if needed
    const mfaEnabled = context.getConfig<boolean>('mfaEnabled') ?? this.config.mfaRequired ?? false;

    // Create middleware
    const authMiddleware = createMiddleware('auth', async (ctx) => {
      // Plugin-specific logic
      const user = ctx.user as { id?: string } | undefined;
      
      if (!user?.id) {
        return false;
      }

      // Call authentication API
      if (mfaEnabled) {
        // MFA check logic
        return await this.checkMFA(user.id);
      }

      return true;
    });

    // Register middleware
    // You can use registerPreMiddleware, registerPostMiddleware, or registerMiddleware
    context.registerMiddleware(authMiddleware);

    return [authMiddleware];
  }

  private async checkMFA(userId: string): Promise<boolean> {
    // Plugin-specific implementation
    return true;
  }
}
```

### 3. Export Plugin

```typescript
// src/index.ts
export { AuthPlugin } from './plugin';
export type { AuthPluginConfig } from './plugin';
```

### 4. Package Configuration

```json
{
  "name": "ngxsmk-gatekeeper-plugin-auth",
  "version": "1.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "ngxsmk-gatekeeper": "^1.1.0",
    "@angular/core": "^17.0.0"
  }
}
```

## Using a Plugin

### 1. Install Plugin

```bash
npm install ngxsmk-gatekeeper-plugin-auth
```

### 2. Register Plugin

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { provideExtensions } from 'ngxsmk-gatekeeper/lib/extensions';
import { AuthPlugin } from 'ngxsmk-gatekeeper-plugin-auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({
      middlewares: [], // Extensions will add their middleware
      onFail: '/login',
    }),
    provideExtensions([
      new AuthPlugin({
        apiKey: 'your-api-key',
        mfaRequired: true,
      }),
    ]),
  ],
});
```

## Middleware Execution Order

Extensions can register middleware in three positions:

1. **Pre-middleware**: Runs before user-configured middleware
   ```typescript
   context.registerPreMiddleware(authMiddleware);
   ```

2. **Merged middleware**: Runs with user-configured middleware
   ```typescript
   context.registerMiddleware(permissionMiddleware);
   ```

3. **Post-middleware**: Runs after user-configured middleware
   ```typescript
   context.registerPostMiddleware(auditMiddleware);
   ```

**Final execution order:**
```
[Extension Pre] → [User Middleware] → [Extension Merged] → [Extension Post]
```

## Extension Context API

The `ExtensionContext` provides plugins with access to core APIs:

```typescript
interface ExtensionContext {
  // Read configuration values
  getConfig<T>(key: string): T | undefined;
  
  // Get full configuration
  getFullConfig(): Record<string, unknown>;
  
  // Register middleware in different positions
  registerPreMiddleware(...middlewares: NgxMiddleware[]): void;
  registerPostMiddleware(...middlewares: NgxMiddleware[]): void;
  registerMiddleware(...middlewares: NgxMiddleware[]): void;
}
```

## Best Practices

### 1. Plugin Naming

Use descriptive package names for plugins:
- `ngxsmk-gatekeeper-plugin-name`
- `ngxsmk-gatekeeper-plugin-features`

### 2. Version Compatibility

Declare peer dependencies correctly:
```json
{
  "peerDependencies": {
    "ngxsmk-gatekeeper": "^1.1.0",
    "@angular/core": "^17.0.0"
  }
}
```

### 3. Error Handling

Handle errors gracefully in plugin initialization:
```typescript
async initialize(context: ExtensionContext): Promise<NgxMiddleware[]> {
  try {
    // Plugin initialization
    return [middleware];
  } catch (error) {
    console.error(`[${this.id}] Initialization failed:`, error);
    return []; // Return empty array on error
  }
}
```

### 4. Configuration

Allow plugins to be configured via gatekeeper config:
```typescript
// In application
provideGatekeeper({
  middlewares: [],
  onFail: '/login',
  // Plugin-specific config
  'auth': {
    mfaRequired: true,
  },
});

// In plugin
const config = context.getConfig<{ mfaRequired?: boolean }>('auth');
```

### 5. Cleanup

Implement destroy method for cleanup:
```typescript
async destroy(): Promise<void> {
  // Cleanup resources
  // Close connections, clear timers, etc.
}
```

## Example: Feature Plugin

```typescript
// ngxsmk-gatekeeper-plugin-features/src/index.ts
import { GatekeeperExtension, ExtensionContext } from 'ngxsmk-gatekeeper/lib/extensions';
import { createMiddleware } from 'ngxsmk-gatekeeper/lib/helpers';

export interface FeaturePluginConfig {
  apiKey: string;
  features?: string[];
}

export class FeaturePlugin implements GatekeeperExtension {
  readonly id = 'ngxsmk-gatekeeper-plugin-features';
  readonly name = 'Features Plugin';
  readonly version = '1.1.0';

  constructor(private config: FeaturePluginConfig) {}

  async initialize(context: ExtensionContext): Promise<NgxMiddleware[]> {
    const features = this.config.features ?? [];
    
    const middlewares = [];

    // Add feature-specific middleware
    if (features.includes('advanced-auth')) {
      middlewares.push(this.createAdvancedAuthMiddleware());
    }

    if (features.includes('rate-limiting')) {
      middlewares.push(this.createRateLimitMiddleware());
    }

    // Register middleware
    context.registerMiddleware(...middlewares);

    return middlewares;
  }

  private createAdvancedAuthMiddleware() {
    return createMiddleware('advanced-auth', async (ctx) => {
      // Advanced authentication logic
      return true;
    });
  }

  private createRateLimitMiddleware() {
    return createMiddleware('rate-limit', async (ctx) => {
      // Rate limiting logic
      return true;
    });
  }
}
```

## Core Guarantees

The core provides these guarantees:

1. **Zero knowledge of plugins**: Core doesn't import or depend on plugin code
2. **Extension API stability**: Extension API is part of the core and maintains backward compatibility
3. **Middleware execution**: Extensions can register middleware that executes in the chain
4. **Configuration access**: Extensions can read gatekeeper configuration
5. **No breaking changes**: Core changes won't break plugins (within major version)

## Limitations

1. **Plugin discovery**: Plugins must be explicitly registered (no auto-discovery)
2. **Plugin dependencies**: Plugins cannot depend on other plugins directly (use extension registry)
3. **Core API surface**: Plugins can only use the extension API (no access to internal APIs)
4. **Version compatibility**: Plugins must be compatible with the core version

## Summary

The plugin architecture enables:

✅ **Open source core** - Core remains free and open source  
✅ **Paid plugins** - Plugins can be distributed as paid packages  
✅ **Clean separation** - Core has zero knowledge of plugin implementations  
✅ **Extension API** - Standardized API for plugin registration  
✅ **Flexible integration** - Plugins register middleware via extension API  

This architecture allows the core to remain open source while enabling a plugin ecosystem, including paid plugins, without the core needing to know about them.

