# Angular Signals Support

ngxsmk-gatekeeper is fully optimized for Angular 17+ and provides first-class support for **Angular Signals**.

## Overview

While the library was built using RxJS Observables, we have integrated Signals into all core services to provide a more synchronous and ergonomic developer experience for modern Angular applications.

## Services with Signal Support

### GatekeeperAgentService

The security agent exposes its entire status as a Signal:

```typescript
// Accessing the status signal
const status = agent.status(); // Returns AgentStatus
console.log(status.mode); 
```

### ObservabilityService

Monitor your application's health and performance reactively:

```typescript
// In your component
export class MonitorComponent {
  connected = this.observability.connected; // Signal<boolean>
  stats = this.observability.stats;         // Signal<AggregatedStats | null>
  
  constructor(private observability: ObservabilityService) {}
}
```

### ShowcaseService

If you are using the Showcase/Gallery module:

```typescript
export class GalleryComponent {
  // Directly bind to the entries signal
  entries = this.showcaseService.entries; // Signal<ShowcaseEntry[]>
  
  constructor(private showcaseService: ShowcaseService) {}
}
```

### VisualBuilderService

The state of the visual builder is also available as a Signal:

```typescript
export class BuilderComponent {
  state = this.builder.stateSignal; // Signal<VisualBuilderState>
  
  constructor(private builder: VisualBuilderService) {}
}
```

## Why use Signals?

1.  **Synchronous Access**: Read the current state without needing `async` pipes or complex subscriptions.
2.  **Fine-grained Reactivity**: Only the parts of your template that depend on a specific signal value will re-render when it changes.
3.  **Better Performance**: Signals are optimized for Angular's change detection cycle.
4.  **Modern Codebase**: Built compatible with Angular 17, 18, 19, and the upcoming v20.

## RxJS Interoperability

We still provide the standard RxJS Observables (e.g., `stats$`, `events$`) alongside Signals. You can easily convert between them using Angular's `toSignal` and `toObservable` utilities if needed.

```typescript
import { toSignal } from '@angular/core/rxjs-interop';

// Convert our event stream to a signal if you prefer
const lastEvent = toSignal(this.observability.events$);
```
