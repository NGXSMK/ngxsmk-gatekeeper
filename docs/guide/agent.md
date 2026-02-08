# Gatekeeper Agent

The Gatekeeper Agent is an autonomous security sub-system that proactively monitors your application's security posture, traffic anomalies, and configuration risks.

## Overview

Unlike standard middleware that reacts to individual requests, the Agent runs in the background to:
- **Scan configuration** for security best practices.
- **Monitor error rates** across all middleware.
- **Detect traffic spikes** or potential DDoS attempts.
- **Provide dynamic mitigation** through mode switching.

## Getting Started

### Installation

The Agent is included in the core package. To enable it, provide the `GatekeeperAgentService` in your application configuration.

```typescript
import { provideGatekeeperAgent } from 'ngxsmk-gatekeeper';

export const appConfig: ApplicationConfig = {
  providers: [
    provideGatekeeperAgent({
      mode: 'monitor', // default mode
      scanOnStartup: true,
      checkInterval: 300000 // 5 minutes
    })
  ]
};
```

## Agent Modes

The Agent operates in four distinct modes:

| Mode | Description |
|------|-------------|
| `monitor` | Only logs issues and alerts. No automated actions are taken. |
| `enforce` | Actively blocks requests that violate critical security rules. |
| `strict` | Heightened security; triggers on lower thresholds for anomalies. |
| `panic` | Maximum lockdown; only critical/whitelisted paths are allowed. |

### Dynamic Mode Switching

You can switch the Agent's mode at runtime based on your own logic:

```typescript
const agent = inject(GatekeeperAgentService);

// Switch to panic mode if your own sensors detect a breach
agent.setMode('panic');
```

## Reactive Status (Signals)

The Agent exposes its current state via Angular Signals, making it easy to build security dashboards into your app.

```typescript
@Component({
  selector: 'app-security-status',
  template: `
    <div class="status-card" [class.active]="agent.status().active">
      <h3>Agent: {{ agent.status().mode | uppercase }}</h3>
      <p>Active Alerts: {{ agent.status().alerts }}</p>
      <p>Last Check: {{ agent.status().lastCheck | date:'mediumTime' }}</p>
      
      <div *ngIf="agent.status().lastScan as scan">
        <h4>Security Score: {{ scan.score }}%</h4>
        <p *ngIf="scan.score < 100" class="warning">
          Found {{ scan.risks.length }} potential risks.
        </p>
      </div>
    </div>
  `
})
export class SecurityStatusComponent {
  constructor(public agent: GatekeeperAgentService) {}
}
```

## Security Scans

The Agent periodically runs the `analyzeSecurity` validator against your `GatekeeperConfig`. It looks for:
- Missing authentication on sensitive routes.
- Permissive IP whitelists.
- Insecure header configurations.
- Missing audit logs in production environments.

## Alerting

When the Agent detects an issue, it:
1. Increments the `alerts` counter in its status.
2. Logs a warning to the console with specific recommendations.
3. Records the event in the `ObservabilityService`.
4. Triggers the optional `onAlert` callback if configured.

```typescript
provideGatekeeperAgent({
  onAlert: (alert) => {
    // Send to your Slack/Discord webhook or PagerDuty
    this.externalMonitoring.report(alert);
  }
})
```
