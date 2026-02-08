# Monitoring & Analytics

Track, analyze, and monitor your application's behavior.

## Request Analytics

Track request metrics and send to analytics services:

```typescript
import { createAnalyticsMiddleware } from 'ngxsmk-gatekeeper';

const analyticsMiddleware = createAnalyticsMiddleware({
  sink: {
    track: async (event) => {
      // Send to your analytics service
      await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event)
      });
    }
  },
  trackMetrics: true,
  includeUserInfo: false, // Privacy: don't include user info
  trackOnlyFailures: false
});
```

### Custom Event Transformation

```typescript
const customAnalytics = createAnalyticsMiddleware({
  sink: customAnalyticsSink,
  transformEvent: (context, success, duration) => {
    return {
      timestamp: Date.now(),
      method: context['request']?.method,
      url: context['request']?.url,
      success,
      duration,
      customField: context['custom']?.value
    };
  }
});
```

## A/B Testing

Implement A/B testing with variant assignment:

```typescript
import { createABTestMiddleware } from 'ngxsmk-gatekeeper';

const abTestMiddleware = createABTestMiddleware({
  tests: {
    'new-dashboard': {
      variants: [
        { name: 'A', weight: 50 },
        { name: 'B', weight: 50 }
      ],
      persist: true, // Persist variant for user
      storageKey: 'ab-test:dashboard'
    },
    'checkout-flow': {
      variants: [
        { name: 'control', weight: 33 },
        { name: 'variant-1', weight: 33 },
        { name: 'variant-2', weight: 34 }
      ],
      persist: true
    }
  },
  variantMiddleware: {
    'new-dashboard': {
      'A': dashboardV1Middleware,
      'B': dashboardV2Middleware
    }
  }
});

// Access variant in context
// context['abTests']['new-dashboard'] === 'A' | 'B'
```

## Request Logging

Log requests for debugging and monitoring:

```typescript
import { createRequestLoggingMiddleware } from 'ngxsmk-gatekeeper';

const loggingMiddleware = createRequestLoggingMiddleware({
  logLevel: 'info',
  includeBody: false, // Don't log sensitive data
  includeHeaders: true,
  includeQuery: true,
  format: 'json',
  sensitiveHeaders: [
    'authorization',
    'cookie',
    'x-api-key',
    'x-csrf-token'
  ],
  logOnlyFailures: false,
  logger: (level, message, data) => {
    // Custom logger
    console[level](message, data);
  }
});
```

### Log Formats

```typescript
// JSON format (default)
const jsonLogging = createRequestLoggingMiddleware({
  format: 'json'
});

// Pretty format
const prettyLogging = createRequestLoggingMiddleware({
  format: 'pretty'
});

// Text format
const textLogging = createRequestLoggingMiddleware({
  format: 'text'
});
```

## Combining Monitoring

```typescript
import { definePipeline } from 'ngxsmk-gatekeeper';

const monitoringPipeline = definePipeline('monitoring', [
  analyticsMiddleware,
  abTestMiddleware,
  loggingMiddleware
]);
```

## Examples

### Full Monitoring Setup

```typescript
const fullMonitoring = definePipeline('full-monitoring', [
  createAnalyticsMiddleware({
    sink: {
      track: async (event) => {
        // Send to multiple services
        await Promise.all([
          sendToGoogleAnalytics(event),
          sendToMixpanel(event),
          sendToCustomService(event)
        ]);
      }
    }
  }),
  createABTestMiddleware({
    tests: {
      'homepage': {
        variants: [
          { name: 'A', weight: 50 },
          { name: 'B', weight: 50 }
        ],
        persist: true
      }
    }
  }),
  createRequestLoggingMiddleware({
    logLevel: 'info',
    format: 'json',
    includeBody: false
  })
]);
```

### Error-Only Logging

```typescript
const errorLogging = createRequestLoggingMiddleware({
  logLevel: 'error',
  logOnlyFailures: true,
  includeBody: true, // Include body for error debugging
  format: 'pretty'
});
```

## Best Practices

1. **Privacy first** - Don't log sensitive data
2. **Redact sensitive headers** - Use `sensitiveHeaders` option
3. **Batch analytics** - Batch events for performance
4. **Monitor failures** - Track error rates and patterns
5. **A/B test properly** - Ensure statistical significance

## Next Steps

- [Gatekeeper Agent](/guide/agent) - Autonomous security monitoring
- [Performance](/guide/performance) - Performance optimization
- [Debug Mode](/guide/debug-mode) - Debugging tools

