# Features Overview

ngxsmk-gatekeeper provides **30+ built-in middleware features** organized into categories.

## Security Middleware (8 features)

Protect your application from security threats.

### IP Filtering
- **IP Whitelisting** - Allow requests only from specific IPs or CIDR ranges
- **IP Blacklisting** - Block requests from specific IPs

### Request Protection
- **CSRF Protection** - Protect against Cross-Site Request Forgery attacks
- **API Key Validation** - Validate API keys from headers or query parameters
- **Webhook Signature Verification** - Verify webhook signatures

### Session & Access
- **Session Management** - Automatic session timeout and renewal
- **Account Lockout** - Lock accounts after failed authentication attempts

### Device & Browser
- **Device Fingerprinting** - Track and validate device fingerprints
- **User-Agent Validation** - Block bots and validate browsers

## Access Control (3 features)

Control when and where users can access your application.

- **Time-Based Access** - Restrict access to business hours or specific time windows
- **Maintenance Mode** - Enable maintenance mode with admin IP whitelisting
- **Geographic Restrictions** - Block or allow access based on country

## Authentication (3 features)

Advanced authentication features.

- **Multi-Factor Authentication (MFA)** - Enforce MFA with TOTP, SMS, or email
- **OAuth2/OIDC** - OAuth2 and OpenID Connect authentication
- **JWT Token Refresh** - Automatic JWT token renewal before expiry

## Request Processing (4 features)

Validate and process requests before they reach your application.

- **Request Validation** - Validate request body, query, params, and headers
- **Request Size Limits** - Enforce size limits to prevent DoS attacks
- **Request Deduplication** - Prevent duplicate requests within a time window
- **API Versioning** - Handle API versioning with header or query parameter

## Advanced Control (4 features)

Advanced patterns for complex scenarios.

- **Conditional Middleware** - Execute different middleware based on conditions
- **Circuit Breaker** - Implement circuit breaker pattern for resilience
- **Retry Logic** - Retry failed requests with exponential/linear backoff
- **Concurrent Limits** - Limit concurrent requests per user or globally

## Analytics & Monitoring (3 features)

Track, analyze, and monitor your application.

- **Request Analytics** - Track request metrics and send to analytics services
- **A/B Testing** - Implement A/B testing with variant assignment
- **Request Logging** - Comprehensive request logging with multiple formats

## Performance & Modern API (4 features)

Optimize your application's performance and developer experience.

- **Cache Middleware** - Cache middleware results to reduce computation
- **Request Batching** - Batch multiple requests together for efficiency
- **Angular Signals Support** - First-class Signals API for all core services
- **Gatekeeper Agent** - Autonomous security monitoring sub-system

## Using Multiple Features

Combine features using pipelines:

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';
import {
  createIPWhitelistMiddleware,
  createCSRFMiddleware,
  createSessionMiddleware,
  createTimeWindowMiddleware,
  createAnalyticsMiddleware
} from 'ngxsmk-gatekeeper/lib/middlewares';

const comprehensivePipeline = definePipeline('comprehensive', [
  createIPWhitelistMiddleware({ allowedIPs: ['10.0.0.0/8'] }),
  createCSRFMiddleware({ tokenHeader: 'X-CSRF-Token' }),
  createSessionMiddleware({ timeout: 3600 }),
  createTimeWindowMiddleware({ allowedHours: { start: 9, end: 17 } }),
  createAnalyticsMiddleware({ sink: analyticsSink })
]);
```

## Documentation

- [Security Guide](/guide/security) - Security features and best practices
- [Access Control](/guide/access-control) - Time windows and geo-blocking
- [Request Processing](/guide/request-processing) - Validation and limits
- [Monitoring](/guide/monitoring) - Analytics and logging
- [Advanced Control](/guide/advanced-control) - Advanced patterns
- [Performance](/guide/performance) - Optimization features
- [Middleware API](/api/middleware) - Complete API reference

