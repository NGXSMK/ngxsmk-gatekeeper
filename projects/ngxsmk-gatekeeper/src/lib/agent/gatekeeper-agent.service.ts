
import { Injectable, Inject, Optional, OnDestroy, signal, WritableSignal } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { filter, bufferTime, map } from 'rxjs/operators';
import { ObservabilityService } from '../observability/observability.service';
import { ObservabilityEventType, MiddlewareExecutionEvent } from '../observability/observability.types';
import { AGENT_CONFIG, AgentConfig, AgentStatus, AgentAlert, AgentMode } from './agent.types';
import { GATEKEEPER_CONFIG } from '../angular/gatekeeper.provider';
import { GatekeeperConfig } from '../angular/gatekeeper.config';
import { analyzeSecurity } from '../validator';
import { ValidationSeverity } from '../validator/validator.types';

@Injectable({
    providedIn: 'root'
})
export class GatekeeperAgentService implements OnDestroy {
    /** Signal for agent status */
    readonly status: WritableSignal<AgentStatus> = signal<AgentStatus>({
        active: false,
        mode: 'monitor',
        uptime: 0,
        alerts: 0,
        lastCheck: Date.now()
    });

    private subscriptions: Subscription = new Subscription();
    private startTime = Date.now();

    constructor(
        @Optional() @Inject(AGENT_CONFIG) private config: AgentConfig | null,
        @Optional() @Inject(GATEKEEPER_CONFIG) private gatekeeperConfig: GatekeeperConfig | null,
        private observability: ObservabilityService
    ) {
        if (!this.config) {
            // Default configuration if none provided
            this.config = {
                mode: 'monitor',
                scanOnStartup: true,
                checkInterval: 300000, // 5 minutes
                errorRateThreshold: 0.1, // 10%
                requestRateThreshold: 100 // 100 req/min
            };
        }
    }

    /**
     * Start the agent
     */
    start(): void {
        const currentStatus = this.status();
        if (currentStatus.active) {
            return;
        }

        console.log('🛡️ Gatekeeper Agent starting in mode:', this.config?.mode);

        this.startTime = Date.now();

        this.status.update(s => ({
            ...s,
            active: true,
            mode: this.config?.mode || 'monitor',
            uptime: 0,
            lastCheck: Date.now()
        }));

        // 1. Run initial security scan
        if (this.config?.scanOnStartup && this.gatekeeperConfig) {
            this.runSecurityScan();
        }

        // 2. Start monitoring
        this.monitorErrors();

        // 3. Periodic checks
        if (this.config?.checkInterval && this.config.checkInterval > 0) {
            const periodicCheck = interval(this.config.checkInterval).subscribe(() => {
                this.runSecurityScan();
            });
            this.subscriptions.add(periodicCheck);
        }

        // 4. Update uptime
        const packetHeartbeat = interval(60000).subscribe(() => {
            this.status.update(s => ({
                ...s,
                uptime: Date.now() - this.startTime,
                lastCheck: Date.now()
            }));
        });
        this.subscriptions.add(packetHeartbeat);
    }

    /**
     * Stop the agent
     */
    stop(): void {
        this.status.update(s => ({ ...s, active: false }));
        this.subscriptions.unsubscribe();
        console.log('🛡️ Gatekeeper Agent stopped');
    }

    /**
     * Get current agent status
     */
    getStatus(): AgentStatus {
        return this.status();
    }

    /**
     * Set agent mode dynamically
     */
    setMode(mode: AgentMode): void {
        if (this.config) {
            this.config.mode = mode;
            this.status.update(s => ({ ...s, mode }));
            console.log(`🛡️ Gatekeeper Agent switched to ${mode} mode`);
        }
    }

    ngOnDestroy(): void {
        this.stop();
    }

    private runSecurityScan(): void {
        if (!this.gatekeeperConfig) {
            return;
        }

        console.debug('🛡️ Gatekeeper Agent running security scan...');
        const result = analyzeSecurity(this.gatekeeperConfig);

        this.status.update(s => ({ ...s, lastScan: result, lastCheck: Date.now() }));

        // Report specific issues
        if (result.score === 100) {
            return;
        }

        const criticalRisks = result.risks.filter(r => r.severity === ValidationSeverity.Error);
        const criticalRecommendations = result.recommendations.filter(i => i.severity === ValidationSeverity.Error);

        if (criticalRisks.length > 0 || criticalRecommendations.length > 0) {
            this.raiseAlert({
                id: `scan-${Date.now()}`,
                timestamp: Date.now(),
                type: 'configuration_issue',
                severity: 'high',
                message: `Security scan found ${criticalRisks.length} critical risks and ${criticalRecommendations.length} critical recommendations`,
                details: { risks: criticalRisks, recommendations: criticalRecommendations },
                recommendation: 'Review gatekeeper configuration immediately.'
            });
        } else if ((result.risks.length > 0 || result.recommendations.length > 0) && this.config?.mode === 'strict') {
            this.raiseAlert({
                id: `scan-${Date.now()}`,
                timestamp: Date.now(),
                type: 'configuration_issue',
                severity: 'medium',
                message: `Security scan found ${result.risks.length} risks and ${result.recommendations.length} recommendations`,
                details: { risks: result.risks, recommendations: result.recommendations }
            });
        }
    }

    private monitorErrors(): void {
        // Monitor excessive middleware errors
        const errorStream = this.observability.events$.pipe(
            filter(event => event.type === ObservabilityEventType.ERROR || (event.type === ObservabilityEventType.MIDDLEWARE_END && (event as MiddlewareExecutionEvent).result === false))
        );

        // Buffer errors every minute to check rate
        const errorRateSub = errorStream.pipe(
            bufferTime(60000), // Check every minute
            map(events => events.length)
        ).subscribe(count => {
            // If we assume threshold is a count for simplicity in this MVP
            const limit = 20; // Arbitrary 20 errors/min hard limit for alert

            if (count > limit) {
                this.raiseAlert({
                    id: `high-error-${Date.now()}`,
                    timestamp: Date.now(),
                    type: 'high_error_rate',
                    severity: 'high',
                    message: `Detected ${count} security errors in the last minute`,
                    recommendation: 'Investigate potential attack or misconfiguration.'
                });

                if (this.config?.mode === 'enforce' || this.config?.mode === 'strict') {
                    // Could trigger automated mitigation here
                }
            }
        });
        this.subscriptions.add(errorRateSub);
    }

    private raiseAlert(alert: AgentAlert): void {
        this.status.update(s => ({ ...s, alerts: s.alerts + 1 }));
        console.warn(`[Gatekeeper Agent Alert] ${alert.severity.toUpperCase()}: ${alert.message}`);

        if (this.config?.onAlert) {
            this.config.onAlert(alert);
        }

        // Also emit to observability as a metric
        this.observability.recordError(
            `Agent Alert: ${alert.message}`,
            undefined,
            'system',
            { alert }
        );
    }
}
