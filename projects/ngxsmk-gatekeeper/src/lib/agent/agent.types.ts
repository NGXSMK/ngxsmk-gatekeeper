
/**
 * Gatekeeper Agent Types
 */

import { InjectionToken } from '@angular/core';
import { SecurityAnalysis } from '../validator';

export const AGENT_CONFIG = new InjectionToken<AgentConfig>('AGENT_CONFIG');

export type AgentMode = 'monitor' | 'enforce' | 'strict' | 'panic';

export interface AgentConfig {
    /**
     * Operation mode for the agent
     * - monitor: Only logs issues and alerts
     * - enforce: Automatically applies security policies (default)
     * - strict: Applies stricter policies and blocks suspicious activity aggressively
     * - panic: Locks down the application to essential traffic only
     */
    mode: AgentMode;

    /**
     * Whether to run a security scan on startup
     * @default true
     */
    scanOnStartup?: boolean;

    /**
     * Interval in milliseconds to run periodic security checks
     * Set to 0 to disable periodic checks
     * @default 300000 (5 minutes)
     */
    checkInterval?: number;

    /**
     * Threshold for error rate before triggering an alert (0-1)
     * @default 0.05 (5%)
     */
    errorRateThreshold?: number;

    /**
     * Maximum requests per minute allowed per IP before alerting
     * @default 100
     */
    requestRateThreshold?: number;

    /**
     * Callback for security alerts
     */
    onAlert?: (alert: AgentAlert) => void;
}

export interface AgentAlert {
    id: string;
    timestamp: number;
    type: 'security_violation' | 'high_error_rate' | 'high_traffic' | 'configuration_issue';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    details?: Record<string, unknown>;
    recommendation?: string;
}

export interface AgentStatus {
    active: boolean;
    mode: AgentMode;
    uptime: number;
    alerts: number;
    lastScan?: SecurityAnalysis;
    lastCheck: number;
}
