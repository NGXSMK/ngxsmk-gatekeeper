import { createMiddleware, getValueByPath } from '../helpers';
import { MiddlewareContext } from '../core';
import { HttpRequest } from '@angular/common/http';

/**
 * Configuration options for device fingerprinting middleware
 */
export interface DeviceFingerprintMiddlewareOptions {
  /**
   * Whether to track devices
   * Default: true
   */
  trackDevices?: boolean;
  /**
   * Whether to block suspicious devices
   * Default: false
   */
  blockSuspicious?: boolean;
  /**
   * Whether to require device registration
   * Default: false
   */
  requireDeviceRegistration?: boolean;
  /**
   * Path to device fingerprint in context
   * Default: 'device.fingerprint'
   */
  fingerprintPath?: string;
  /**
   * Path to registered devices in context
   * Default: 'user.registeredDevices'
   */
  registeredDevicesPath?: string;
  /**
   * Function to generate device fingerprint
   */
  generateFingerprint?: (context: MiddlewareContext) => string;
  /**
   * Function to check if device is suspicious
   */
  isSuspicious?: (fingerprint: string, context: MiddlewareContext) => boolean | Promise<boolean>;
  /**
   * Redirect URL when device is blocked
   */
  redirect?: string;
}

/**
 * Generates a simple device fingerprint from available data
 */
function generateSimpleFingerprint(context: MiddlewareContext): string {
  const request = context['request'] as HttpRequest<unknown> | undefined;
  const parts: string[] = [];

  if (request) {
    const userAgent = request.headers.get('user-agent') || '';
    const acceptLanguage = request.headers.get('accept-language') || '';
    parts.push(userAgent, acceptLanguage);
  }

  // Add screen resolution if available (would need to be passed in context)
  const screen = context['screen'] as { width?: number; height?: number } | undefined;
  if (screen) {
    parts.push(`${screen.width}x${screen.height}`);
  }

  return btoa(parts.join('|')).substring(0, 32);
}



/**
 * Creates middleware that tracks and validates device fingerprints
 *
 * @param options - Configuration options
 * @returns Middleware function
 */
export function createDeviceFingerprintMiddleware(
  options: DeviceFingerprintMiddlewareOptions = {}
): ReturnType<typeof createMiddleware> {
  const {
    trackDevices = true,
    blockSuspicious = false,
    requireDeviceRegistration = false,
    fingerprintPath = 'device.fingerprint',
    registeredDevicesPath = 'user.registeredDevices',
    generateFingerprint = generateSimpleFingerprint,
    isSuspicious,
    redirect,
  } = options;

  return createMiddleware('device-fingerprint', async (context: MiddlewareContext) => {
    if (!trackDevices) {
      return true;
    }

    // Generate or get fingerprint
    let fingerprint = getValueByPath(context, fingerprintPath) as string | undefined;
    if (!fingerprint) {
      fingerprint = generateFingerprint(context);
      // Store in context
      if (!context['device']) {
        context['device'] = {};
      }
      (context['device'] as Record<string, unknown>)['fingerprint'] = fingerprint;
    }

    // Check if device is suspicious
    if (blockSuspicious && isSuspicious) {
      const suspicious = await isSuspicious(fingerprint, context);
      if (suspicious) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: 'Suspicious device detected',
          };
        }
        return false;
      }
    }

    // Check device registration
    if (requireDeviceRegistration) {
      const registeredDevices = getValueByPath(context, registeredDevicesPath) as string[] | undefined;
      if (!registeredDevices || !registeredDevices.includes(fingerprint)) {
        if (redirect) {
          return {
            allow: false,
            redirect,
            reason: 'Device not registered',
          };
        }
        return false;
      }
    }

    return true;
  });
}

