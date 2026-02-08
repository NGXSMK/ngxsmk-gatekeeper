# Observability Module

Real-time monitoring and analytics for ngxsmk-gatekeeper middleware execution.

## Overview

The observability module provides:

- **Real-time event streaming** via WebSocket
- **Performance metrics** and analytics
- **Middleware execution tracking**
- **Error monitoring**
- **Aggregated statistics**

## Architecture

```
┌─────────────────┐
│  Middleware     │
│  Execution      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Observability   │
│ Service         │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Event  │ │ WebSocket    │
│Collector│ │ Client       │
└────────┘ └──────┬───────┘
                  │
                  ▼
         ┌─────────────────┐
         │ WebSocket       │
         │ Server          │
         └─────────────────┘
                  │
                  ▼
         ┌─────────────────┐
         │ Dashboard       │
         │ UI              │
         └─────────────────┘
```

## Components

### ObservabilityService

Main service for collecting and streaming observability events.

```typescript
import { ObservabilityService } from 'ngxsmk-gatekeeper/lib/observability';

const service = inject(ObservabilityService);

// Record events
service.recordMiddlewareStart(name, index, context, 'route', '/admin');
service.recordMiddlewareEnd(name, index, context, 'route', '/admin', true, 15);

// Get statistics
const stats = service.getStats({ start: Date.now() - 60000, end: Date.now() });
```

### ObservabilityWebSocketClient

WebSocket client for real-time event streaming.

```typescript
import { ObservabilityWebSocketClient } from 'ngxsmk-gatekeeper/lib/observability';

const client = new ObservabilityWebSocketClient(
  { url: 'ws://localhost:8080' },
  {
    onEvent: (event) => console.log('Event:', event),
    onStats: (stats) => console.log('Stats:', stats),
  }
);

client.connect();
client.subscribe({ eventTypes: [ObservabilityEventType.CHAIN_END] });
```

### EventCollector

In-memory event collector for local statistics.

```typescript
import { InMemoryEventCollector } from 'ngxsmk-gatekeeper/lib/observability';

const collector = new InMemoryEventCollector(1000);
collector.collect(event);
const stats = collector.getStats();
```

### Integration Hooks

Integration hooks for middleware execution.

```typescript
import { createObservabilityHooks } from 'ngxsmk-gatekeeper/lib/observability';

const hooks = createObservabilityHooks({
  service: observabilityService,
  contextType: 'route',
  contextPath: '/admin',
});

hooks.onChainStart(context, middlewareCount);
hooks.onChainEnd(context, result, stoppedAt, duration);
```

## Event Types

- `MIDDLEWARE_START` - Middleware execution started
- `MIDDLEWARE_END` - Middleware execution completed
- `CHAIN_START` - Chain execution started
- `CHAIN_END` - Chain execution completed
- `ERROR` - Error occurred
- `METRIC` - Performance metric
- `ANALYTICS` - Analytics event
- `HEALTH` - Health check

## WebSocket Protocol

### Message Types

- `SUBSCRIBE` - Subscribe to events
- `UNSUBSCRIBE` - Unsubscribe from events
- `EVENT` - Event broadcast
- `AGGREGATE` - Aggregated statistics
- `PING` / `PONG` - Keepalive

### Message Format

```typescript
interface WebSocketMessage {
  type: WebSocketMessageType;
  payload?: unknown;
  timestamp?: number;
}
```

## Usage

### Setup

```typescript
import { provideObservability } from 'ngxsmk-gatekeeper/lib/observability';

bootstrapApplication(AppComponent, {
  providers: [
    provideObservability({
      websocketUrl: 'ws://localhost:8080',
      enableRealtime: true,
      autoConnect: true,
    }),
  ],
});
```

### Dashboard Component (with Signals)

```typescript
@Component({
  selector: 'app-dashboard',
  template: `
    <div *ngIf="connected()">
      <div *ngIf="stats() as stats">
        <p>Total: {{ stats.totalRequests }}</p>
        <p>Success: {{ stats.successfulRequests }}</p>
        <p>Avg Time: {{ stats.averageResponseTime }}ms</p>
      </div>
    </div>
  `,
})
export class DashboardComponent {
  stats = this.observability.stats;
  connected = this.observability.connected;

  constructor(private observability: ObservabilityService) {}
}
```

## WebSocket Server

You'll need to implement a WebSocket server. See `websocket.server.example.ts` for a reference implementation.

## Best Practices

1. **Development Only**: Use observability primarily in development
2. **Filter Events**: Subscribe only to relevant event types
3. **Secure WebSocket**: Use WSS in production
4. **Rate Limiting**: Implement rate limiting on server
5. **Local Aggregation**: Use local collector for client-side analytics

## See Also

- [Observability Documentation](../../../../docs/observability/)
- [Examples](../../examples/observability/)

