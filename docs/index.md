---
layout: home

hero:
  name: ngxsmk-gatekeeper
  text: Middleware Engine for Angular
  tagline: Route and HTTP request protection through a composable middleware pattern
  image:
    src: /logo.svg
    alt: ngxsmk-gatekeeper
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/NGXSMK/ngxsmk-gatekeeper

features:
  - icon: 🎯
    title: Simple API
    details: Intuitive, composable middleware pattern that's easy to understand and use
  - icon: 🔧
    title: Type-Safe
    details: Full TypeScript support with comprehensive types and excellent IDE support
  - icon: 🚀
    title: Tree-Shakeable
    details: Only bundle what you use - zero overhead for unused features
  - icon: 📦
    title: Zero Dependencies
    details: Lightweight core with optional features - no bloat
  - icon: 🛠️
    title: Flexible
    details: Works with sync, Promise, and Observable patterns seamlessly
  - icon: 🎨
    title: Composable
    details: Build complex protection logic from simple, reusable pieces
  - icon: 🔒
    title: Security Features
    details: 30+ built-in middleware for IP filtering, CSRF, session management, and more
  - icon: ⚡
    title: Performance
    details: Built-in caching, batching, and optimization middleware
  - icon: 📊
    title: Monitoring
    details: Analytics, A/B testing, and request logging out of the box
  - icon: 🛠️
    title: Developer Tools
    details: Schematics, CLI, visual builder, testing utilities, and more
  - icon: 📋
    title: Templates
    details: Pre-built configurations for SaaS, e-commerce, API, and more
  - icon: 🛰️
    title: Angular Signals
    details: First-class support for Angular Signals (17+) across all core services
  - icon: 🛡️
    title: Security Agent
    details: Autonomous background agent for real-time monitoring and security audits
  - icon: 🌟
    title: Showcase
    details: Real-world implementations and case studies from the community
---

## Quick Start

Install the library:

```bash
npm install ngxsmk-gatekeeper
```

Use in your Angular app:

```typescript
import { provideGatekeeper, gatekeeperGuard } from 'ngxsmk-gatekeeper';
import { createAuthMiddleware } from 'ngxsmk-gatekeeper/lib/middlewares';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideGatekeeper({
      middlewares: [createAuthMiddleware()],
      onFail: '/login',
    }),
  ],
};
```

Protect your routes:

```typescript
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [gatekeeperGuard],
  },
];
```

## What Problem Does It Solve?

Angular applications often need to protect routes and HTTP requests based on authentication, authorization, feature flags, or other business logic. **ngxsmk-gatekeeper** provides:

- ✅ A unified middleware pattern for both route and HTTP protection
- ✅ Composable middleware functions that can be chained together
- ✅ A single configuration that applies to both routes and HTTP requests
- ✅ Support for synchronous, Promise-based, and Observable-based middleware
- ✅ Built-in middleware examples for common scenarios

## Fully Open Source

**ngxsmk-gatekeeper** is **100% open source** and **completely free** to use. All features are available without any restrictions:

- ✅ Core Middleware Engine
- ✅ Route & HTTP Protection
- ✅ Debug Mode & Benchmarking
- ✅ Authentication Adapters (Auth0, Firebase, JWT)
- ✅ Compliance Mode (SOC2, ISO)
- ✅ License Verification
- ✅ Plugin Architecture
- ✅ Angular Schematics
- ✅ CLI Tool
- ✅ Visual Builder
- ✅ Testing Utilities
- ✅ Template Library
- ✅ Observability Dashboard
- ✅ Middleware Marketplace
- ✅ Showcase Gallery
- ✅ All features included

[Learn more about the plugin architecture →](/guide/plugins)

