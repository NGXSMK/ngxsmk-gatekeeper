# ngxsmk-gatekeeper - The Ultimate Angular Route & HTTP Protection Library

[![npm version](https://img.shields.io/npm/v/ngxsmk-gatekeeper.svg)](https://www.npmjs.com/package/ngxsmk-gatekeeper)
[![npm downloads](https://img.shields.io/npm/dm/ngxsmk-gatekeeper.svg)](https://www.npmjs.com/package/ngxsmk-gatekeeper)
[![Angular](https://img.shields.io/badge/Angular-17%2B-red.svg)](https://angular.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](./SECURITY.md)

> **Stop writing duplicate route guards and HTTP interceptors. Start protecting your Angular app in 30 seconds.**

**ngxsmk-gatekeeper** is the most powerful, developer-friendly middleware engine for Angular. Protect routes and HTTP requests with a single, composable configuration. **100% open source. Zero dependencies. Production-ready.**

## Why Developers Love This Library

**The Problem:** You're writing custom guards for routes, separate interceptors for HTTP, duplicating logic, and struggling to compose protection rules.

**The Solution:** One middleware pattern. One configuration. Works everywhere. Type-safe. Tree-shakeable. Zero bloat.

### Get Protected in 30 Seconds

```bash
npm install ngxsmk-gatekeeper
```

```typescript
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

// 1. Create middleware (one line)
const authMiddleware = createAuthMiddleware({ authPath: 'user.isAuthenticated' });

// 2. Configure (one provider)
bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({ middlewares: [authMiddleware], onFail: '/login' }),
  ],
});

// 3. Protect routes (one guard)
const routes: Routes = [
  { path: 'dashboard', canActivate: [gatekeeperGuard], loadComponent: () => import('./dashboard.component') },
];
```

**Done.** Your routes are protected. HTTP requests too. No boilerplate. No duplication.

## What Makes This Special?

### Built for Angular Developers

- **Next.js Middleware Experience** - If you love Next.js middleware, you'll love this
- **Functional API** - Modern Angular 17+ patterns, no legacy code
- **Standalone-Only** - Built for the future of Angular
- **TypeScript First** - Full type safety, autocomplete, zero runtime errors

### Performance That Matters

- **Tree-Shakeable** - Only bundle what you use (zero overhead)
- **Zero Dependencies** - Lightweight core, no bloat
- **Optimized Execution** - Fast middleware chains, minimal overhead
- **Built-in Benchmarking** - Identify bottlenecks automatically
- **Angular Signals** - Fully optimized for Angular Signals (17+)
- **SEO Friendly** - Doesn't block crawlers; supports proper status codes and redirects

### Developer Experience That Delights

- **Debug Mode** - See exactly what's happening in your middleware
- **Composable** - Build complex logic from simple pieces
- **Flexible** - Sync, Promise, or Observable - your choice
- **Well-Documented** - Comprehensive docs with real examples

## Key Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Route Protection** | Protect routes with functional guards | Production Ready |
| **HTTP Protection** | Protect API calls with interceptors | Production Ready |
| **Composable Middleware** | Chain middleware like Next.js | Production Ready |
| **Type-Safe** | Full TypeScript support | Production Ready |
| **Tree-Shakeable** | Zero bundle overhead | Production Ready |
| **Debug Mode** | Built-in debugging and benchmarking | Production Ready |
| **Authentication Adapters** | Auth0, Firebase, JWT support | Included |
| **Compliance Mode** | SOC2, ISO 27001 ready | Included |
| **Plugin Architecture** | Extensible and customizable | Included |

### Developer Tools

| Feature | Description | Status |
|---------|-------------|--------|
| **Angular Schematics** | Code generators for middleware and pipelines | Available |
| **Interactive Playground** | Try it live in StackBlitz/CodeSandbox | Available |
| **Standalone CLI Tool** | Init, analyze, test, and export commands | Available |
| **Testing Utilities** | Mock contexts, assertions, and test helpers | Available |
| **Configuration Validator** | Type checking, performance, and security analysis | Available |
| **Visual Middleware Builder** | Drag-and-drop interface for building middleware | Available |
| **Real-time Observability** | WebSocket monitoring and analytics dashboard | Available |
| **Template Library** | Pre-built configurations for common scenarios | Available |
| **Middleware Marketplace** | Discover and install community plugins | Available |
| **Showcase Gallery** | Real-world implementations and case studies | Available |

### Security Middleware (8 features)

- **IP Whitelisting/Blacklisting** - Allow/block specific IPs or CIDR ranges
- **CSRF Protection** - Protect against Cross-Site Request Forgery
- **Session Management** - Automatic session timeout and renewal
- **API Key Validation** - Protect APIs with key validation
- **Account Lockout** - Brute force protection
- **Webhook Signature Verification** - Verify webhook signatures
- **Device Fingerprinting** - Track and validate devices
- **User-Agent Validation** - Block bots and validate browsers

### Access Control (3 features)

- **Time-Based Access** - Restrict access by time/day
- **Maintenance Mode** - Enable maintenance with admin access
- **Geographic Restrictions** - Block/allow by country

### Authentication (3 features)

- **Multi-Factor Authentication (MFA)** - Enforce MFA
- **OAuth2/OIDC** - OAuth2 authentication support
- **JWT Token Refresh** - Automatic token renewal

### Request Processing (4 features)

- **Request Validation** - Validate body, query, params, headers
- **Request Size Limits** - Prevent DoS attacks
- **Request Deduplication** - Prevent duplicate requests
- **API Versioning** - Handle API versioning

### Advanced Control (4 features)

- **Conditional Middleware** - If/else logic in chains
- **Circuit Breaker** - Resilience pattern
- **Retry Logic** - Retry with backoff strategies
- **Concurrent Limits** - Limit concurrent requests

### Analytics & Monitoring (3 features)

- **Request Analytics** - Track metrics and events
- **A/B Testing** - Implement A/B tests
- **Request Logging** - Comprehensive request logging

### Performance (2 features)

- **Cache Middleware** - Cache middleware results
- **Request Batching** - Batch requests together

## Real-World Examples

### Authentication Protection

```typescript
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

const authMiddleware = createAuthMiddleware({
  authPath: 'user.isAuthenticated',
});

provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
});
```

### Using Templates

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();

// Create configuration from template
const config = await loader.createConfig('saas', {
  roles: ['user', 'admin'],
  enableRateLimit: true,
});

provideGatekeeper(config);
```

### Role-Based Access Control

```typescript
import { createAuthMiddleware, createRoleMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';
import { definePipeline } from 'ngxsmk-gatekeeper';

// Create reusable pipeline
const adminPipeline = definePipeline('adminOnly', [
  createAuthMiddleware(),
  createRoleMiddleware({ roles: ['admin'], mode: 'any' }),
]);

// Use in routes
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [gatekeeperGuard],
    data: { gatekeeper: { middlewares: [adminPipeline] } },
  },
];
```

### HTTP Request Protection

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Same middleware works for HTTP too!
provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);
```

### Security Features

```typescript
import { 
  createIPWhitelistMiddleware,
  createCSRFMiddleware,
  createSessionMiddleware,
  createAPIKeyMiddleware
} from 'ngxsmk-gatekeeper/lib/middlewares';

const securityPipeline = definePipeline('security', [
  createIPWhitelistMiddleware({ allowedIPs: ['10.0.0.0/8'] }),
  createCSRFMiddleware({ tokenHeader: 'X-CSRF-Token' }),
  createSessionMiddleware({ timeout: 3600 }),
  createAPIKeyMiddleware({ validateKey: async (key) => await checkKey(key) })
]);
```

### Access Control

```typescript
import { 
  createTimeWindowMiddleware,
  createMaintenanceModeMiddleware,
  createGeoBlockMiddleware,
  DayOfWeek
} from 'ngxsmk-gatekeeper/lib/middlewares';

const accessControl = definePipeline('access', [
  createTimeWindowMiddleware({
    allowedHours: { start: 9, end: 17 },
    allowedDays: [DayOfWeek.Monday, DayOfWeek.Friday]
  }),
  createMaintenanceModeMiddleware({ enabled: false }),
  createGeoBlockMiddleware({ allowedCountries: ['US', 'CA'] })
]);
```

### Monitoring & Analytics

```typescript
import { 
  createAnalyticsMiddleware,
  createABTestMiddleware,
  createRequestLoggingMiddleware
} from 'ngxsmk-gatekeeper/lib/middlewares';

const monitoring = definePipeline('monitoring', [
  createAnalyticsMiddleware({ sink: analyticsSink }),
  createABTestMiddleware({ tests: { 'feature': { variants: [...] } } }),
  createRequestLoggingMiddleware({ logLevel: 'info' })
]);
```

## Perfect For

- **Enterprise Applications** - SOC2, ISO compliance ready
- **SaaS Products** - Multi-tenant, role-based access
- **E-commerce** - Payment protection, cart security
- **Admin Dashboards** - Complex permission systems
- **Public APIs** - Rate limiting, authentication
- **Any Angular App** - That needs route or HTTP protection

## Why Choose ngxsmk-gatekeeper?

### vs. Writing Custom Guards

| Custom Guards | ngxsmk-gatekeeper |
|---------------|-------------------|
| Duplicate logic for routes and HTTP | One middleware, works everywhere |
| Hard to compose and reuse | Composable pipelines |
| No type safety | Full TypeScript support |
| Difficult to debug | Built-in debug mode |
| No performance insights | Built-in benchmarking |

### vs. Other Libraries

- **More Flexible** - Works with sync, Promise, and Observable
- **Better DX** - Debug mode, benchmarking, type safety
- **Zero Dependencies** - Lighter than alternatives
- **Modern API** - Functional guards, standalone-only
- **Production Ready** - Used in real applications

## Quick Start Guide

### Step 1: Install

```bash
npm install ngxsmk-gatekeeper
```

### Step 2: Configure

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

bootstrapApplication(AppComponent, {
  providers: [
    provideGatekeeper({
      middlewares: [createAuthMiddleware()],
      onFail: '/login',
    }),
  ],
});
```

### Step 3: Protect Routes

```typescript
import { gatekeeperGuard } from 'ngxsmk-gatekeeper';

const routes: Routes = [
  { path: 'dashboard', canActivate: [gatekeeperGuard], loadComponent: () => import('./dashboard.component') },
];
```

### Step 4: Protect HTTP (Optional)

```typescript
import { gatekeeperInterceptor } from 'ngxsmk-gatekeeper';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

provideHttpClient(
  withInterceptors([gatekeeperInterceptor])
);
```

**That's it!** Your app is now protected.

## Complete Documentation

- **[Full Documentation](https://NGXSMK.github.io/ngxsmk-gatekeeper)** - Complete guide with examples
- **[Interactive Playground](https://NGXSMK.github.io/ngxsmk-gatekeeper/playground/)** - Try it in your browser
- **[Template Library](https://NGXSMK.github.io/ngxsmk-gatekeeper/templates/)** - Pre-built configurations
- **[Angular Schematics](./schematics/README.md)** - Code generators
- **[CLI Tool](./tools/cli/README.md)** - Standalone command-line interface
- **[Testing Utilities](https://NGXSMK.github.io/ngxsmk-gatekeeper/testing/)** - Testing helpers and mocks
- **[Configuration Validator](https://NGXSMK.github.io/ngxsmk-gatekeeper/validation/)** - Validate your setup
- **[Middleware Marketplace](https://NGXSMK.github.io/ngxsmk-gatekeeper/marketplace/)** - Discover plugins
- **[Observability Dashboard](https://NGXSMK.github.io/ngxsmk-gatekeeper/observability/)** - Real-time monitoring
- **[Visual Builder](https://NGXSMK.github.io/ngxsmk-gatekeeper/visual-builder/)** - Drag-and-drop middleware builder
- **[Showcase Gallery](https://NGXSMK.github.io/ngxsmk-gatekeeper/showcase/)** - User implementations
- **[Quick Start Guide](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/quick-start)** - Get started in 5 minutes
- **[Middleware Pattern](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/middleware-pattern)** - Learn the core concept
- **[Route Protection](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/route-protection)** - Protect your routes
- **[HTTP Protection](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/http-protection)** - Protect API calls
- **[Examples](https://NGXSMK.github.io/ngxsmk-gatekeeper/examples/)** - Copy-paste ready examples

## Advanced Features

### Debug Mode

See exactly what's happening:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  debug: true, // Enable debug logging
});
```

**Output:**
```
[Gatekeeper] Chain started: /dashboard
[Gatekeeper] Middleware[0] (auth): ✓ Passed (2.3ms)
[Gatekeeper] Chain completed: ✓ Allowed (3.4ms)
```

### Performance Benchmarking

Identify bottlenecks automatically:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  benchmark: {
    enabled: true,
    middlewareThreshold: 100, // Warn if > 100ms
    chainThreshold: 500,       // Warn if > 500ms
  },
});
```

### Custom Middleware

Build your own protection logic:

```typescript
import { createMiddleware } from 'ngxsmk-gatekeeper';

const customMiddleware = createMiddleware('custom', (context) => {
  // Your logic here
  return context.user?.hasPermission('custom-permission') ?? false;
});
```

### Developer Tools

#### Angular Schematics

Generate middleware and pipelines with Angular CLI:

```bash
ng add ngxsmk-gatekeeper
ng generate ngxsmk-gatekeeper:middleware auth
ng generate ngxsmk-gatekeeper:pipeline admin
```

#### CLI Tool

Analyze and test your configuration:

```bash
npx @ngxsmk-gatekeeper/cli init
npx @ngxsmk-gatekeeper/cli analyze
npx @ngxsmk-gatekeeper/cli test
```

#### Visual Builder

Build middleware chains visually with drag-and-drop:

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';

const builder = new VisualBuilderService();
// Use the visual builder UI to create middleware chains
```

#### Real-time Observability

Monitor middleware execution in real-time:

```typescript
import { provideObservability } from 'ngxsmk-gatekeeper/lib/observability';

provideObservability({
  websocketUrl: 'ws://localhost:8080',
  enableRealtime: true,
});
```

#### Template Library

Use pre-built configurations:

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();
const config = await loader.createConfig('saas', {
  roles: ['user', 'admin'],
  enableRateLimit: true,
});
```

#### Configuration Validator

Validate your setup:

```typescript
import { ConfigValidator } from 'ngxsmk-gatekeeper/lib/validator';

const validator = inject(ConfigValidator);
const result = await validator.validate(config);
console.log(result.issues);
```

#### Testing Utilities

Test middleware easily:

```typescript
import { createMockContext, expectMiddlewareToAllow } from 'ngxsmk-gatekeeper/lib/testing';

const context = createMockContext({ user: { isAuthenticated: true } });
await expectMiddlewareToAllow(authMiddleware(context));
```

## Learn More

### Documentation

- **[Getting Started](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/getting-started)** - Introduction and overview
- **[Installation](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/installation)** - Setup instructions
- **[Middleware Pattern](https://NGXSMK.github.io/ngxsmk-gatekeeper/guide/middleware-pattern)** - Core concepts
- **[API Reference](https://NGXSMK.github.io/ngxsmk-gatekeeper/api/)** - Complete API documentation

### Examples

- **[Minimal Auth Demo](./projects/ngxsmk-gatekeeper/examples/demos/minimal-auth-demo.ts)** - Basic authentication
- **[Role-Based Routing](./projects/ngxsmk-gatekeeper/examples/demos/role-based-routing-demo.ts)** - RBAC example
- **[HTTP Protection](./projects/ngxsmk-gatekeeper/examples/demos/http-protection-demo.ts)** - API protection

## Production Ready

- **Type-Safe** - Full TypeScript support
- **Tree-Shakeable** - Zero bundle overhead
- **Well-Tested** - Comprehensive test coverage with testing utilities
- **Well-Documented** - Complete documentation with examples
- **Security-First** - Responsible disclosure policy
- **Long-Term Support** - Clear LTS strategy
- **Developer Tools** - Schematics, CLI, visual builder, and more
- **Community** - Marketplace, showcase gallery, and active development

## Requirements

- **Angular 17+** (Standalone components required)
- **TypeScript 5.9+**
- **Node.js 18+**

## Contributing

We welcome contributions! Whether it's:

- Bug reports
- Feature requests
- Documentation improvements
- Code contributions
- Starring the repo

**Read our [Contributing Guide](./CONTRIBUTING.md) to get started.**

## License

MIT License - see [LICENSE](./LICENSE) file for details.

**100% open source. Free forever. No restrictions.**

## Show Your Support

If this library helps you build better Angular applications:

- **Star the repository**
- **Share with your team**
- **Tweet about it**
- **Leave feedback**

## Links

- [npm Package](https://www.npmjs.com/package/ngxsmk-gatekeeper)
- [Documentation](https://NGXSMK.github.io/ngxsmk-gatekeeper)
- [Issue Tracker](https://github.com/NGXSMK/ngxsmk-gatekeeper/issues)
- [Discussions](https://github.com/NGXSMK/ngxsmk-gatekeeper/discussions)
- [Security Policy](./SECURITY.md)

## Acknowledgments

Built with love for the Angular community. Inspired by Next.js middleware pattern.

---

**Made by developers, for developers.**

**Questions?** Open an issue or start a discussion. We're here to help!
