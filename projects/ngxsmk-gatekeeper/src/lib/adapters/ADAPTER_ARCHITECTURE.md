# Adapter Architecture

## Overview

ngxsmk-gatekeeper uses an adapter architecture that allows authentication providers (Auth0, Firebase, Custom JWT, etc.) to integrate with the core without the core having any knowledge of the adapter's implementation. All adapters are open source and free to use.

## Core Principles

1. **Core remains open source**: The core library has zero knowledge of adapter implementations.
2. **Adapters are separate packages**: Adapters are distributed as separate npm packages.
3. **Adapter API**: Adapters implement the `AuthAdapter` interface, which is part of the open-source core.
4. **No core dependencies on adapters**: The core doesn't import or depend on any adapter code.

## Architecture

```
┌─────────────────────────────────────────┐
│         Core (Open Source)              │
│  ┌───────────────────────────────────┐  │
│  │    Adapter API (Public)           │  │
│  │  - AuthAdapter interface          │  │
│  │  - AdapterRegistry                 │  │
│  │  - createAdapterMiddleware()       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │    Middleware Runner (Internal)   │  │
│  │  - Executes adapter middleware    │  │
│  │  - Handles authentication results  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ▲
              │ Implements AuthAdapter
              │
┌─────────────┴─────────────┐
│   Adapter (Separate Pkg)  │
│  - Auth0Adapter           │
│  - FirebaseAdapter        │
│  - JWTAdapter             │
│  - No core dependencies   │
└───────────────────────────┘
```

## Creating an Adapter

### 1. Create Adapter Package

```bash
npm init -y
npm install ngxsmk-gatekeeper
```

### 2. Implement AuthAdapter Interface

```typescript
// src/adapter.ts
import { AuthAdapter, AuthResult, AuthUser } from 'ngxsmk-gatekeeper/lib/adapters';
import { MiddlewareContext } from 'ngxsmk-gatekeeper';

export interface MyAdapterConfig {
  apiKey: string;
  endpoint: string;
}

export class MyAdapter implements AuthAdapter {
  readonly id = 'ngxsmk-gatekeeper-adapter-my';
  readonly name = 'My Authentication Adapter';
  readonly version = '1.1.0';

  constructor(private config: MyAdapterConfig) {}

  async authenticate(context: MiddlewareContext): Promise<AuthResult> {
    // Extract token from context
    const token = this.extractToken(context);
    
    if (!token) {
      return {
        authenticated: false,
        error: 'No token found',
      };
    }

    // Validate token with your service
    const isValid = await this.validateToken(token);
    
    if (!isValid) {
      return {
        authenticated: false,
        error: 'Invalid token',
      };
    }

    // Extract user information
    const user = await this.getUser(token);

    return {
      authenticated: true,
      user,
    };
  }

  private extractToken(context: MiddlewareContext): string | null {
    // Extract token from headers, localStorage, etc.
    if (context.request) {
      const authHeader = context.request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }
    }
    return null;
  }

  private async validateToken(token: string): Promise<boolean> {
    // Validate token with your service
    // In a real implementation, call your API
    return true;
  }

  private async getUser(token: string): Promise<AuthUser> {
    // Get user information from token or API
    return {
      id: 'user-123',
      email: 'user@example.com',
    };
  }
}
```

### 3. Export Adapter

```typescript
// src/index.ts
export { MyAdapter } from './adapter';
export type { MyAdapterConfig } from './adapter';
```

### 4. Package Configuration

```json
{
  "name": "ngxsmk-gatekeeper-adapter-my",
  "version": "1.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "peerDependencies": {
    "ngxsmk-gatekeeper": "^1.1.0",
    "@angular/core": "^17.0.0"
  }
}
```

## Using an Adapter

### 1. Install Adapter

```bash
npm install ngxsmk-gatekeeper-adapter-my
```

### 2. Register and Use Adapter

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { provideAdapters, createAdapterMiddleware } from 'ngxsmk-gatekeeper/lib/adapters';
import { MyAdapter } from 'ngxsmk-gatekeeper-adapter-my';

bootstrapApplication(AppComponent, {
  providers: [
    // Register adapter (optional, for registry access)
    provideAdapters([
      new MyAdapter({
        apiKey: 'your-api-key',
        endpoint: 'https://api.example.com',
      }),
    ]),

    // Create middleware using adapter
    provideGatekeeper({
      middlewares: [
        createAdapterMiddleware(
          new MyAdapter({
            apiKey: 'your-api-key',
            endpoint: 'https://api.example.com',
          }),
          {
            requireAuth: true,
            redirectOnFail: '/login',
            autoRefresh: true,
          }
        ),
      ],
      onFail: '/login',
    }),

    provideRouter(routes),
    provideHttpClient(withInterceptors([gatekeeperInterceptor])),
  ],
});
```

## Adapter Interface

### AuthAdapter

```typescript
interface AuthAdapter {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  
  authenticate(context: MiddlewareContext): AuthResult | Promise<AuthResult>;
  refresh?(context: MiddlewareContext): AuthResult | Promise<AuthResult>;
  logout?(context: MiddlewareContext): void | Promise<void>;
  destroy?(): void | Promise<void>;
}
```

### AuthResult

```typescript
interface AuthResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
  metadata?: Record<string, unknown>;
}
```

### AuthUser

```typescript
interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  roles?: string[];
  permissions?: string[];
  metadata?: Record<string, unknown>;
}
```

## Middleware Options

```typescript
interface AdapterMiddlewareOptions {
  requireAuth?: boolean;        // Require authentication (default: true)
  autoRefresh?: boolean;        // Auto-refresh token (default: false)
  redirectOnFail?: string;      // Redirect path on failure
  onError?: (error: string, context: MiddlewareContext) => void;
  onSuccess?: (user: AuthUser, context: MiddlewareContext) => void;
}
```

## Example Adapters

### Auth0 Adapter

```typescript
import { AuthAdapter } from 'ngxsmk-gatekeeper/lib/adapters';

export class Auth0Adapter implements AuthAdapter {
  readonly id = 'ngxsmk-gatekeeper-adapter-auth0';
  readonly name = 'Auth0 Adapter';
  readonly version = '1.1.0';

  constructor(private config: { domain: string; clientId: string }) {}

  async authenticate(context: MiddlewareContext): Promise<AuthResult> {
    // Validate Auth0 token
    // Extract user from token
    // Return AuthResult
  }
}
```

### Firebase Adapter

```typescript
import { AuthAdapter } from 'ngxsmk-gatekeeper/lib/adapters';

export class FirebaseAdapter implements AuthAdapter {
  readonly id = 'ngxsmk-gatekeeper-adapter-firebase';
  readonly name = 'Firebase Adapter';
  readonly version = '1.1.0';

  constructor(private config: { apiKey: string; authDomain: string }) {}

  async authenticate(context: MiddlewareContext): Promise<AuthResult> {
    // Validate Firebase ID token
    // Extract user from token
    // Return AuthResult
  }
}
```

### Custom JWT Adapter

```typescript
import { AuthAdapter } from 'ngxsmk-gatekeeper/lib/adapters';

export class JWTAdapter implements AuthAdapter {
  readonly id = 'ngxsmk-gatekeeper-adapter-jwt';
  readonly name = 'Custom JWT Adapter';
  readonly version = '1.1.0';

  constructor(private config: { secret: string; issuer?: string }) {}

  async authenticate(context: MiddlewareContext): Promise<AuthResult> {
    // Validate JWT token
    // Extract user from token claims
    // Return AuthResult
  }
}
```

## Best Practices

### 1. Token Extraction

Extract tokens from multiple sources:

```typescript
private extractToken(context: MiddlewareContext): string | null {
  // 1. From HTTP headers
  if (context.request) {
    const authHeader = context.request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
  }

  // 2. From localStorage (for routes)
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage.getItem('token');
  }

  // 3. From context metadata
  const token = (context as Record<string, unknown>).token as string | undefined;
  return token || null;
}
```

### 2. Token Validation

Always validate tokens properly:

```typescript
private async validateToken(token: string): Promise<boolean> {
  try {
    // 1. Decode token
    const decoded = this.decodeToken(token);
    if (!decoded) return false;

    // 2. Check expiration
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return false;
    }

    // 3. Verify signature (use proper JWT library)
    // 4. Verify issuer and audience
    // 5. Check custom claims

    return true;
  } catch {
    return false;
  }
}
```

### 3. Error Handling

Handle errors gracefully:

```typescript
async authenticate(context: MiddlewareContext): Promise<AuthResult> {
  try {
    // Authentication logic
    return { authenticated: true, user };
  } catch (error) {
    return {
      authenticated: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
```

### 4. User Mapping

Map token claims to user:

```typescript
private mapUser(decoded: Record<string, unknown>): AuthUser {
  return {
    id: decoded.sub as string,
    email: decoded.email as string,
    name: decoded.name as string,
    roles: (decoded.roles as string[]) || [],
    permissions: (decoded.permissions as string[]) || [],
  };
}
```

## Core Guarantees

The core provides these guarantees:

1. **Zero knowledge of adapters**: Core doesn't import or depend on adapter code
2. **Adapter API stability**: Adapter API is part of the core and maintains backward compatibility
3. **Middleware creation**: Adapters can create middleware via `createAdapterMiddleware()`
4. **No breaking changes**: Core changes won't break adapters (within major version)

## Limitations

1. **Adapter discovery**: Adapters must be explicitly registered (no auto-discovery)
2. **Adapter dependencies**: Adapters cannot depend on other adapters directly
3. **Core API surface**: Adapters can only use the adapter API (no access to internal APIs)
4. **Version compatibility**: Adapters must be compatible with the core version

## Summary

The adapter architecture enables:

✅ **Open source core** - Core remains free and open source  
✅ **Open source adapters** - Adapters can be distributed as separate packages (all open source)  
✅ **Clean separation** - Core has zero knowledge of adapter implementations  
✅ **Adapter API** - Standardized API for authentication adapters  
✅ **Flexible integration** - Adapters integrate via AuthAdapter interface  

This architecture allows the core to remain open source while enabling authentication providers (Auth0, Firebase, Custom JWT, etc.) to integrate seamlessly without the core needing to know about them. All adapters are open source and free to use.

