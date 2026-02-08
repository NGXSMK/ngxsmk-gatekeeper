# Compliance Mode

## Overview

Compliance Mode is designed for **SOC2, ISO 27001, and similar compliance frameworks**. It ensures that your access control system meets audit requirements by providing:

- **Deterministic Execution Order**: Middleware always executes in the same, documented order
- **Explicit Allow/Deny Outcomes**: All decisions are clear, traceable, and documented
- **Structured Logs**: Parseable logs (JSON, CSV, JSONL) for compliance audits
- **Autonomous Auditing**: Continuous security scanning via the [Gatekeeper Agent](../agent/README.md) (v1.1.0)

## Key Features

### 1. Deterministic Execution Order

Middleware executes in a **predictable, documented order** every time. This ensures:

- Consistent behavior across all requests
- Reproducible access control decisions
- Easy verification during compliance audits

**How it works:**
- Middleware executes sequentially in the order defined in configuration
- Execution order is logged and traceable
- No random or non-deterministic behavior

### 2. Explicit Allow/Deny Outcomes

Every access decision is **explicitly documented** with:

- Clear decision (allow/deny)
- Primary reason for the decision
- Contributing factors
- Which middleware passed/failed
- Applied policies or permissions

**Example Decision Rationale:**
```json
{
  "decision": "deny",
  "primaryReason": "Middleware 'auth' denied access",
  "contributingFactors": [
    "User not authenticated",
    "Redirect to: /login"
  ],
  "contributingMiddleware": [
    {
      "name": "auth",
      "index": 0,
      "contribution": "denied",
      "reason": "User authentication check failed"
    }
  ]
}
```

### 3. Structured Logs

Logs are generated in **structured, parseable formats**:

- **JSON**: Human-readable, easy to parse
- **CSV**: Compatible with spreadsheet tools
- **JSONL**: One JSON object per line (streaming-friendly)

**Log Format:**
```json
{
  "id": "log-1234567890-abc123",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "eventType": "access_decision",
  "decision": "allow",
  "reason": "All middleware checks passed",
  "resource": "/api/dashboard",
  "method": "GET",
  "userId": "user-123",
  "executionTrace": {
    "chainId": "chain-1234567890-xyz789",
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": "2024-01-15T10:30:00.150Z",
    "duration": 150,
    "middlewareExecutions": [
      {
        "index": 0,
        "name": "auth",
        "startTime": "2024-01-15T10:30:00.000Z",
        "endTime": "2024-01-15T10:30:00.050Z",
        "duration": 50,
        "result": "allow",
        "reason": "User is authenticated"
      }
    ]
  },
  "decisionRationale": {
    "decision": "allow",
    "primaryReason": "All middleware checks passed",
    "contributingFactors": [],
    "contributingMiddleware": [
      {
        "name": "auth",
        "index": 0,
        "contribution": "allowed",
        "reason": "This middleware allowed access"
      }
    ]
  },
  "compliance": {
    "framework": "SOC2",
    "retentionPolicy": "SOC2-CC6.1"
  }
}
```

## Configuration

### Basic Usage

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';

provideGatekeeper({
  middlewares: [authMiddleware, permissionMiddleware],
  onFail: '/unauthorized',
  compliance: {
    enabled: true,
    logFormat: 'json',
    includeExecutionTrace: true,
    includeDecisionRationale: true,
    logRetention: {
      days: 90,
      policy: 'SOC2-CC6.1',
    },
  },
});
```

### With Compliance Audit Sink

```typescript
import { provideGatekeeper } from 'ngxsmk-gatekeeper';
import { ComplianceAuditSink } from 'ngxsmk-gatekeeper/lib/compliance';
import { RemoteApiAuditSink } from 'ngxsmk-gatekeeper/lib/audit';

const complianceSink = new ComplianceAuditSink(
  new RemoteApiAuditSink({
    endpoint: 'https://logs.example.com/compliance',
    batch: true,
  }),
  {
    logFormat: 'json',
    includeExecutionTrace: true,
    includeDecisionRationale: true,
  }
);

provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/login',
  audit: {
    sinks: complianceSink,
  },
  compliance: {
    enabled: true,
    logFormat: 'json',
  },
});
```

## Compliance Framework Support

### SOC2

**Common Criteria (CC) Coverage:**
- **CC6.1**: Logical and physical access controls
- **CC6.2**: Prior to issuing system credentials and granting system access
- **CC6.3**: The entity discontinues system access after termination
- **CC6.6**: The entity implements logical access security software

**Features:**
- Complete audit trails
- Access decision documentation
- User identification (sanitized)
- Execution traces

### ISO 27001

**Control Coverage:**
- **A.9.1.2**: Access to networks and network services
- **A.9.2.1**: User registration and de-registration
- **A.9.2.3**: Management of privileged access rights
- **A.9.4.2**: Secure log-on procedures

**Features:**
- Structured logging
- Access control documentation
- Audit trail completeness
- Decision traceability

## Best Practices

### 1. Enable in Production

Compliance mode should be enabled in production for audit readiness:

```typescript
provideGatekeeper({
  middlewares: [authMiddleware],
  onFail: '/unauthorized',
  compliance: {
    enabled: true, // Always enabled in production
    logFormat: 'json',
  },
});
```

### 2. Use Structured Log Format

Use JSON format for easy parsing and analysis:

```typescript
compliance: {
  enabled: true,
  logFormat: 'json', // Recommended for compliance
}
```

### 3. Configure Log Retention

Set retention policy according to compliance requirements:

```typescript
compliance: {
  enabled: true,
  logRetention: {
    days: 90, // SOC2 typically requires 90 days
    policy: 'SOC2-CC6.1',
  },
}
```

### 4. Integrate with SIEM

Send compliance logs to your Security Information and Event Management (SIEM) system:

```typescript
const complianceSink = new ComplianceAuditSink(
  new RemoteApiAuditSink({
    endpoint: 'https://siem.example.com/compliance',
  }),
  { logFormat: 'json' }
);
```

### 5. Document Middleware Order

Document your middleware execution order in compliance documentation:

```typescript
// Documented middleware order:
// 1. Authentication middleware
// 2. Permission middleware
// 3. Feature flag middleware
provideGatekeeper({
  middlewares: [
    authMiddleware,      // 1. Check authentication
    permissionMiddleware, // 2. Check permissions
    featureFlagMiddleware, // 3. Check feature flags
  ],
  compliance: {
    enabled: true,
  },
});
```

## Limitations

### Client-Side Only

Compliance mode runs in the browser and provides client-side logging. For complete compliance:

1. **Server-side validation required**: Always implement server-side access control
2. **Log aggregation**: Collect logs from both client and server
3. **Log integrity**: Ensure logs cannot be tampered with (use server-side logging)
4. **Log retention**: Implement proper log retention on the server side

### Not a Security Measure

Compliance mode is a **logging and documentation tool**, not a security measure:

- Logs can be disabled or modified by determined attackers
- Client-side logs should be verified against server-side logs
- Use server-side logging for authoritative audit trails

### Performance Considerations

Compliance mode adds overhead:

- Execution trace generation
- Decision rationale creation
- Structured log formatting

For high-traffic applications, consider:
- Sampling (log only a percentage of requests)
- Async logging (don't block request processing)
- Batch logging (send logs in batches)

## Compliance Reporting

### Generating Reports

Compliance logs can be analyzed to generate reports:

```typescript
// Example: Analyze compliance logs
const logs = getComplianceLogs(); // From your log store

// Access decisions by user
const decisionsByUser = logs.reduce((acc, log) => {
  if (log.userId) {
    acc[log.userId] = acc[log.userId] || { allow: 0, deny: 0 };
    acc[log.userId][log.decision]++;
  }
  return acc;
}, {});

// Access decisions by resource
const decisionsByResource = logs.reduce((acc, log) => {
  acc[log.resource] = acc[log.resource] || { allow: 0, deny: 0 };
  acc[log.resource][log.decision]++;
  return acc;
}, {});
```

### Audit Trail Completeness

Compliance mode ensures complete audit trails:

- Every access decision is logged
- Execution order is documented
- Decision rationale is captured
- Timestamps are ISO 8601 compliant
- Unique identifiers for traceability

## Summary

Compliance Mode provides:

✅ **Deterministic execution order** - Predictable, documented behavior  
✅ **Explicit allow/deny outcomes** - Clear, traceable decisions  
✅ **Structured logs** - Parseable formats for compliance audits  
✅ **Complete audit trails** - Full execution traces and decision rationale  
✅ **SOC2/ISO ready** - Designed for compliance framework requirements  

**Remember**: Always implement server-side validation and logging for complete compliance. Client-side compliance mode is a supplement, not a replacement for server-side security controls.

