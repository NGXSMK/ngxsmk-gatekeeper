# Zero Trust Enforcement Mode

## Overview

Zero Trust Mode enforces a security model where **every route and HTTP request must explicitly opt in** with middleware configuration. By default, access is **denied** unless explicitly allowed.

This mode is designed for **enterprise applications** where security is paramount and you need to ensure that no route or API endpoint is accidentally left unprotected.

## Key Principles

1. **Default Deny**: All routes and requests are denied by default
2. **Explicit Opt-In**: Every route/request must have middleware configured
3. **Public Routes Must Declare**: Public routes must explicitly use `publicMiddleware()`
4. **No Silent Failures**: Missing middleware configuration results in explicit denial

## How It Works

### Routes

1. Routes **without** `canActivate: [gatekeeperGuard]` are automatically denied
2. Routes **with** the guard but **no middleware configuration** are denied
3. Routes **must** explicitly configure middleware (global, route-level, or `publicMiddleware()`)

### HTTP Requests

1. Requests **without** middleware configuration are denied
2. Requests **must** explicitly configure middleware (global, request-level, or `publicMiddleware()`)

## Configuration

Enable zero trust mode in your `GatekeeperConfig`:

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';

provideGatekeeper({
  middlewares: [], // No default middleware - each route must opt in
  onFail: '/unauthorized',
  zeroTrust: true, // Enable zero trust mode
});
```

## Usage Examples

### Protected Routes

Protected routes must explicitly configure authentication/authorization middleware:

```typescript
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [createAuthMiddleware()],
      },
    },
  },
  {
    path: 'admin',
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [
          createAuthMiddleware(),
          createRoleMiddleware({ roles: ['admin'] }),
        ],
      },
    },
  },
];
```

### Public Routes

Public routes must explicitly declare using `publicMiddleware()`:

```typescript
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { publicMiddleware } from 'ngxsmk-gatekeeper/lib/zero-trust';

const routes: Routes = [
  {
    path: 'about',
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [publicMiddleware()], // Explicitly public
      },
    },
  },
  {
    path: 'contact',
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [publicMiddleware()], // Explicitly public
      },
    },
  },
];
```

### HTTP Requests

HTTP requests must explicitly configure middleware:

```typescript
import { withGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';
import { publicMiddleware } from 'ngxsmk-gatekeeper/lib/zero-trust';

// Protected API request
http.get('/api/user/profile', {
  context: withGatekeeper([createAuthMiddleware()]),
});

// Public API request
http.get('/api/public/news', {
  context: withGatekeeper([publicMiddleware()]),
});
```

## Enterprise Best Practices

### 1. Use Route-Level Middleware

For fine-grained control, configure middleware at the route level:

```typescript
const routes: Routes = [
  {
    path: 'billing',
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [
          createAuthMiddleware(),
          permissionMiddleware(['billing.read']),
        ],
      },
    },
  },
];
```

### 2. Combine with Audit Logging

Enable audit logging to track all access decisions:

```typescript
import { ConsoleAuditSink } from 'ngxsmk-gatekeeper/lib/audit';

provideGatekeeper({
  middlewares: [],
  onFail: '/unauthorized',
  zeroTrust: true,
  audit: {
    sinks: new ConsoleAuditSink(),
  },
});
```

### 3. Use Policies for Complex Authorization

For complex authorization logic, use the policy engine:

```typescript
import { createPolicyMiddleware } from 'ngxsmk-gatekeeper/lib/policies';

const routes: Routes = [
  {
    path: 'reports',
    canActivate: [gatekeeperGuard],
    data: {
      gatekeeper: {
        middlewares: [
          createPolicyMiddleware({ policyName: 'canAccessReports' }),
        ],
      },
    },
  },
];
```

### 4. Minimize Public Routes

Use `publicMiddleware()` sparingly and only for truly public content:

```typescript
// ✅ Good: Public marketing pages
{
  path: 'about',
  data: {
    gatekeeper: {
      middlewares: [publicMiddleware()],
    },
  },
}

// ❌ Bad: Don't use publicMiddleware for user-facing routes
// Use authentication middleware instead
```

### 5. Document Your Security Model

Document which routes are public and why:

```typescript
const routes: Routes = [
  // Public: Marketing pages (no authentication required)
  {
    path: 'about',
    data: {
      gatekeeper: {
        middlewares: [publicMiddleware()],
      },
    },
  },
  // Protected: User dashboard (authentication required)
  {
    path: 'dashboard',
    data: {
      gatekeeper: {
        middlewares: [createAuthMiddleware()],
      },
    },
  },
];
```

## Migration Guide

### From Default Mode to Zero Trust

1. **Enable zero trust mode**:
   ```typescript
   provideGatekeeper({
     middlewares: [],
     onFail: '/unauthorized',
     zeroTrust: true,
   });
   ```

2. **Add middleware to all routes**:
   - Protected routes: Add authentication/authorization middleware
   - Public routes: Add `publicMiddleware()`

3. **Add middleware to all HTTP requests**:
   - Protected requests: Add authentication/authorization middleware
   - Public requests: Add `publicMiddleware()`

4. **Test thoroughly**:
   - Verify all routes have middleware
   - Verify all API requests have middleware
   - Check audit logs for any denied access

## Troubleshooting

### Route Denied: "Zero Trust Mode: Route does not have explicit middleware configuration"

**Solution**: Add middleware configuration to the route:

```typescript
{
  path: 'my-route',
  canActivate: [gatekeeperGuard],
  data: {
    gatekeeper: {
      middlewares: [/* your middleware here */],
    },
  },
}
```

### Request Denied: "Zero Trust Mode: Request does not have explicit middleware configuration"

**Solution**: Add middleware configuration to the HTTP request:

```typescript
http.get('/api/endpoint', {
  context: withGatekeeper([/* your middleware here */]),
});
```

### Empty Middleware Array After Resolution

**Solution**: Ensure your middleware configuration is valid and resolves to at least one middleware:

```typescript
// Check that middleware is properly configured
const middlewares = [createAuthMiddleware()];
// Ensure middlewares array is not empty
```

### 6. Complement with Security Agent

Use the [Gatekeeper Agent](../agent/README.md) to monitor for configuration gaps or anomalies that might bypass your Zero Trust rules in real-time.

```typescript
provideGatekeeperAgent({
  mode: 'enforce',
  scanOnStartup: true
});
```

## Security Considerations

1. **No Silent Failures**: Zero trust mode ensures that missing middleware configuration results in explicit denial, preventing accidental exposure of protected resources.

2. **Explicit Public Declaration**: Public routes must explicitly declare using `publicMiddleware()`, making it clear which routes are intentionally public.

3. **Audit Trail**: Combine with audit logging to maintain a complete record of all access decisions.

4. **Policy-Based Authorization**: Use the policy engine for complex authorization logic that can be centrally managed and audited.

## Summary

Zero Trust Mode provides a security model where:

- ✅ Every route and request must explicitly opt in
- ✅ Default behavior is deny
- ✅ Public routes must declare `publicMiddleware()`
- ✅ No accidental exposure of protected resources
- ✅ Complete audit trail of access decisions

This mode is ideal for enterprise applications where security is paramount and you need to ensure comprehensive protection of all routes and API endpoints.

