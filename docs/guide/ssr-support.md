# SSR Support

ngxsmk-gatekeeper supports Server-Side Rendering (SSR) with Angular.

## SSR Compatibility

The library is designed to work with Angular Universal and SSR:

- No browser-only APIs in core
- Platform detection for browser features
- SSR adapter support
- **Signals & SSR** - Signals are fully supported in SSR, providing hydration-friendly reactive states.

## Platform Detection

The library automatically detects the platform:

```typescript
// Automatically handles SSR
const isBrowser = typeof window !== 'undefined';
```

## SSR Adapter

Use the SSR adapter for platform-specific features:

```typescript
import { SSR_ADAPTER } from 'ngxsmk-gatekeeper/lib/angular/ssr-adapter';

// Provide SSR adapter
{
  provide: SSR_ADAPTER,
  useValue: {
    getStorage: (key: string) => {
      // Server-side storage implementation
    },
  },
}
```

## Storage in SSR

For features that use localStorage, provide an SSR adapter:

```typescript
import { SSR_ADAPTER } from 'ngxsmk-gatekeeper/lib/angular/ssr-adapter';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';

const ssrAdapter = {
  getStorage: (key: string) => {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformBrowser(platformId)) {
      return localStorage.getItem(key);
    }
    // Server-side fallback
    return null;
  },
  setStorage: (key: string, value: string) => {
    const platformId = inject(PLATFORM_ID);
    if (isPlatformBrowser(platformId)) {
      localStorage.setItem(key, value);
    }
  },
};

provideGatekeeper({
  // ... config
});

{
  provide: SSR_ADAPTER,
  useValue: ssrAdapter,
}
```

## Best Practices

1. **Platform Checks**: Always check platform before using browser APIs
2. **SSR Adapter**: Provide SSR adapter for storage operations
3. **Async Operations**: Use async middleware for server-side operations
4. **Error Handling**: Handle SSR-specific errors gracefully

## Next Steps

- [Configuration](/guide/configuration) - Learn about SSR configuration
- [Examples](/examples/) - See SSR examples

