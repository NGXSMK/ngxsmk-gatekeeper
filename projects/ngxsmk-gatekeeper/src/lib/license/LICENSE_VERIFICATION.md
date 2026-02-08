# License Verification Hook

## Overview

ngxsmk-gatekeeper provides an **optional license verification hook** that allows enterprise plugins to verify licenses. The core does **not enforce licensing** - it only provides the hook.

## Core Principles

1. **Core provides hook only**: The core provides the license verification hook but does not enforce licensing.
2. **Plugins verify licenses**: Enterprise plugins register verifiers to check license validity.
3. **Graceful degradation**: Invalid licenses result in graceful degradation, not blocking functionality.
4. **Never block startup**: License verification never blocks application startup, even if verification fails.

## Architecture

```
┌─────────────────────────────────────────┐
│         Core (Open Source)                │
│  ┌───────────────────────────────────┐  │
│  │    License Hook (Public)          │  │
│  │  - LicenseVerifier interface      │  │
│  │  - LicenseRegistry                 │  │
│  │  - verifyLicense()                 │  │
│  │  - Never blocks startup            │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
              ▲
              │ Implements LicenseVerifier
              │
┌─────────────┴─────────────┐
│   Enterprise Plugin       │
│  - Verifies license       │
│  - Graceful degradation   │
│  - Never blocks startup   │
└───────────────────────────┘
```

## Creating a License Verifier

### 1. Implement LicenseVerifier Interface

```typescript
// src/verifier.ts
import { LicenseVerifier, LicenseVerificationResult } from 'ngxsmk-gatekeeper/lib/license';

export class MyLicenseVerifier implements LicenseVerifier {
  readonly id = '@vendor/gatekeeper-license-verifier';
  readonly name = 'My License Verifier';
  readonly version = '1.1.0';

  async verify(licenseKey: string): Promise<LicenseVerificationResult> {
    try {
      // Verify license with your service
      const isValid = await this.checkLicense(licenseKey);
      
      if (!isValid) {
        return {
          valid: false,
          licenseKey,
          error: 'Invalid license key',
          blockOnInvalid: false, // Never block
        };
      }

      return {
        valid: true,
        licenseKey,
        metadata: {
          type: 'enterprise',
          features: ['advanced-auth', 'audit-logging'],
        },
      };
    } catch (error) {
      // Never throw - return invalid result but don't block
      return {
        valid: false,
        licenseKey,
        error: error instanceof Error ? error.message : String(error),
        blockOnInvalid: false, // Never block
      };
    }
  }

  private async checkLicense(licenseKey: string): Promise<boolean> {
    // Your license verification logic
    return true;
  }
}
```

### 2. Register Verifier

```typescript
import { provideLicenseVerifiers } from 'ngxsmk-gatekeeper/lib/license';
import { MyLicenseVerifier } from './verifier';

bootstrapApplication(AppComponent, {
  providers: [
    // Register license verifier (non-blocking)
    provideLicenseVerifiers([
      new MyLicenseVerifier(),
    ]),
    // Application continues to start even if license is invalid
  ],
});
```

## Using License Verification

### 1. Verify License in Plugin

```typescript
import { verifyLicense } from 'ngxsmk-gatekeeper/lib/license';

async function initializePlugin() {
  const licenseKey = 'your-license-key';
  
  // Verify license (never throws, never blocks)
  const result = await verifyLicense(licenseKey);

  if (result.valid && result.metadata) {
    // License valid - enable premium features
    enablePremiumFeatures(result.metadata);
  } else {
    // License invalid - use free tier (graceful degradation)
    enableFreeTier();
  }

  // Plugin initialization never fails due to license
}
```

### 2. Use License Middleware

```typescript
import { createLicenseMiddleware } from 'ngxsmk-gatekeeper/lib/license';

provideGatekeeper({
  middlewares: [
    createLicenseMiddleware('your-license-key', {
      onError: (error) => {
        console.warn('License invalid:', error);
        // Implement graceful degradation
      },
      onSuccess: (metadata) => {
        console.log('License valid:', metadata);
        // Enable premium features
      },
    }),
  ],
  onFail: '/login',
});
```

### 3. Check License Features

```typescript
import { createLicenseFeatureMiddleware } from 'ngxsmk-gatekeeper/lib/license';

provideGatekeeper({
  middlewares: [
    createLicenseFeatureMiddleware(
      'your-license-key',
      ['advanced-auth', 'audit-logging'],
      {
        onError: (error) => {
          console.warn('Feature not available:', error);
          // Disable premium features gracefully
        },
      }
    ),
  ],
  onFail: '/login',
});
```

## License Verification Result

```typescript
interface LicenseVerificationResult {
  valid: boolean;                    // Whether license is valid
  licenseKey?: string;               // License key that was verified
  error?: string;                    // Error message if invalid
  metadata?: LicenseMetadata;         // License metadata if valid
  blockOnInvalid?: boolean;          // Never set to true (core doesn't block)
}
```

## License Metadata

```typescript
interface LicenseMetadata {
  type?: string;                     // License type (e.g., 'enterprise')
  expiresAt?: string;                // Expiration date (ISO 8601)
  features?: string[];               // Enabled features
  maxUsers?: number;                  // Maximum users (if applicable)
  [key: string]: unknown;            // Additional metadata
}
```

## Best Practices

### 1. Never Block on Invalid License

Always return `blockOnInvalid: false`:

```typescript
async verify(licenseKey: string): Promise<LicenseVerificationResult> {
  const isValid = await this.checkLicense(licenseKey);
  
  return {
    valid: isValid,
    licenseKey,
    blockOnInvalid: false, // Always false
    ...(isValid && { metadata: { /* ... */ } }),
    ...(!isValid && { error: 'Invalid license' }),
  };
}
```

### 2. Implement Graceful Degradation

```typescript
const result = await verifyLicense(licenseKey);

if (result.valid && result.metadata) {
  // Enable premium features
  enablePremiumFeatures(result.metadata.features || []);
} else {
  // Disable premium features gracefully
  disablePremiumFeatures();
  // Show upgrade prompt
  showUpgradePrompt();
  // Application continues to work
}
```

### 3. Cache Verification Results

```typescript
private cache = new Map<string, { result: LicenseVerificationResult; expiresAt: number }>();

async verify(licenseKey: string): Promise<LicenseVerificationResult> {
  // Check cache first
  const cached = this.cache.get(licenseKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.result;
  }

  // Verify license
  const result = await this.verifyWithService(licenseKey);

  // Cache result
  if (result.valid) {
    this.cache.set(licenseKey, {
      result,
      expiresAt: Date.now() + 3600000, // 1 hour
    });
  }

  return result;
}
```

### 4. Handle Errors Gracefully

```typescript
async verify(licenseKey: string): Promise<LicenseVerificationResult> {
  try {
    // Verify license
    return await this.verifyWithService(licenseKey);
  } catch (error) {
    // Never throw - return invalid result but don't block
    return {
      valid: false,
      licenseKey,
      error: error instanceof Error ? error.message : String(error),
      blockOnInvalid: false, // Never block
    };
  }
}
```

## Core Guarantees

The core provides these guarantees:

1. **Never blocks startup**: License verification never blocks application startup
2. **Never throws errors**: `verifyLicense()` always returns a result, never throws
3. **Graceful degradation**: Invalid licenses result in graceful degradation, not blocking
4. **Zero enforcement**: Core does not enforce licensing - only provides the hook

## Limitations

1. **No enforcement**: Core does not enforce licensing - plugins must implement their own enforcement
2. **No blocking**: Invalid licenses never block functionality - only graceful degradation
3. **Plugin responsibility**: Plugins are responsible for implementing license checks and degradation

## Summary

The license verification hook enables:

✅ **Optional verification** - Core provides hook, doesn't enforce  
✅ **Enterprise plugins** - Plugins can verify licenses  
✅ **Graceful degradation** - Invalid licenses don't block functionality  
✅ **Never blocks startup** - Application always starts, regardless of license status  
✅ **Clean separation** - Core has zero knowledge of license enforcement  

This architecture allows the core to remain open source while enabling enterprise plugins to verify licenses and implement graceful degradation without blocking application startup.

