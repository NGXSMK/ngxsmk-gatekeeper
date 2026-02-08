# Gatekeeper Agent

Autonomous security agent for Angular applications.

## Overview

The Gatekeeper Agent is a background service that proactively monitors your application's security posture.

## Features

- **Real-time Monitoring**: Tracks error rates and traffic anomalies.
- **Security Audits**: Automatically audits configuration using `analyzeSecurity`.
- **Dynamic Modes**: Switch between `monitor`, `enforce`, `strict`, and `panic` modes.
- **Angular Signals**: Exposes reactive status via Signals.

## Usage

### Basic Setup

```typescript
// app.config.ts
import { provideGatekeeperAgent } from 'ngxsmk-gatekeeper';

export const appConfig: ApplicationConfig = {
  providers: [
    provideGatekeeperAgent({
      mode: 'monitor',
      scanOnStartup: true
    })
  ]
};
```

### Accessing Agent Status (Signals)

```typescript
@Component({
  template: `
    <div *ngIf="agent.status().active">
      <p>Mode: {{ agent.status().mode }}</p>
      <p>Alerts: {{ agent.status().alerts }}</p>
    </div>
  `
})
export class StatusComponent {
  constructor(public agent: GatekeeperAgentService) {}
}
```

## Configuration

```typescript
interface AgentConfig {
  mode: 'monitor' | 'enforce' | 'strict' | 'panic';
  scanOnStartup?: boolean;
  checkInterval?: number; // ms
  errorRateThreshold?: number;
  onAlert?: (alert: AgentAlert) => void;
}
```
