/**
 * Built-in middleware examples for ngxsmk-gatekeeper
 */

// Core middleware
export * from './auth.middleware';
export * from './role.middleware';
export * from './feature-flag.middleware';
export * from './rate-limit.middleware';

// Security middleware
export * from './ip-filter.middleware';
export * from './csrf.middleware';
export * from './session.middleware';
export * from './api-key.middleware';
export * from './account-lockout.middleware';
export * from './webhook-signature.middleware';
export * from './device-fingerprint.middleware';
export * from './user-agent.middleware';
export * from './bot-protection.middleware';

// Access control middleware
export * from './time-window.middleware';
export * from './maintenance.middleware';
export * from './geo-block.middleware';

// Authentication middleware
export * from './mfa.middleware';
export * from './oauth2.middleware';
export * from './jwt-refresh.middleware';

// Request processing middleware
export * from './request-validation.middleware';
export * from './request-size.middleware';
export * from './request-deduplication.middleware';
export * from './api-versioning.middleware';

// Advanced control middleware
export * from './conditional.middleware';
export * from './circuit-breaker.middleware';
export * from './retry.middleware';
export * from './concurrent-limit.middleware';

// Analytics & monitoring middleware
export * from './analytics.middleware';
export * from './ab-test.middleware';
export * from './request-logging.middleware';

// Performance middleware
export * from './cache.middleware';
export * from './request-batching.middleware';

