# Template Library

Pre-built configuration templates and industry-specific presets for ngxsmk-gatekeeper.

## Overview

The template library provides ready-to-use configurations for common scenarios, making it easy to get started with ngxsmk-gatekeeper.

## Quick Start

```typescript
import { createTemplateLoader } from 'ngxsmk-gatekeeper/lib/templates';

const loader = createTemplateLoader();
const config = await loader.createConfig('basic', {
  authPath: 'user.isAuthenticated',
  onFail: '/login',
});

provideGatekeeper(config);
```

## Available Templates

### Basic Templates

- **basic** - Simple authentication only
- **preset-auth** - Authentication preset

### Industry Templates

- **saas** - Multi-tenant SaaS applications
- **ecommerce** - E-commerce with payment protection
- **api** - API endpoints with API keys

### Security Templates

- **security** - Maximum security configuration

### Compliance Templates

- **compliance** - SOC2, ISO 27001 ready

### Admin Templates

- **preset-admin** - Admin access with roles

## Template Structure

Each template consists of:

1. **Metadata** - Template information (name, description, category)
2. **Factory Function** - Creates configuration from options

## Creating Custom Templates

```typescript
import { Template, TemplateCategory } from 'ngxsmk-gatekeeper/lib/templates';

const myTemplate: Template = {
  metadata: {
    id: 'my-template',
    name: 'My Template',
    description: 'Custom template',
    category: TemplateCategory.Basic,
    version: '1.1.0',
  },
  factory: async (options = {}) => {
    return {
      middlewares: [
        // Your middleware
      ],
      onFail: '/login',
    };
  },
};

// Register
registry.register(myTemplate);
```

## See Also

- [Template Documentation](../../../docs/templates/)
- [Configuration Guide](../../../docs/guide/configuration)
- [Presets](../presets/)

