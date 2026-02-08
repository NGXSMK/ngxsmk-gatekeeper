# Middleware Marketplace

The ngxsmk-gatekeeper marketplace provides a centralized registry for discovering, installing, and rating community-contributed middleware plugins.

## Features

- **Plugin Discovery** - Search npm registry for ngxsmk-gatekeeper plugins
- **Ratings & Reviews** - Community-driven ratings and reviews
- **npm Integration** - Direct integration with npm registry
- **Installation Helpers** - Get installation commands for any package manager
- **Update Management** - Check for plugin updates
- **Angular Signals** - Reactive status and plugin metadata (v1.1.0)

## Architecture

### Components

1. **MarketplaceRegistry** - Main registry service for managing plugins
2. **NpmClient** - Client for interacting with npm registry
3. **PluginInstaller** - Helper for plugin installation and updates
4. **MarketplaceProvider** - Angular provider for marketplace configuration

### Data Flow

```
User Request
    ↓
MarketplaceRegistry
    ↓
NpmClient → npm Registry API
    ↓
Plugin Metadata + Ratings
    ↓
Search Results / Plugin Details
```

## Usage

### Basic Setup

```typescript
import { provideMarketplace } from 'ngxsmk-gatekeeper/lib/marketplace';

bootstrapApplication(AppComponent, {
  providers: [
    provideMarketplace({
      enableCache: true,
      cacheTTL: 3600000, // 1 hour
    }),
  ],
});
```

### Search Plugins

```typescript
import { MarketplaceRegistry, PluginCategory } from 'ngxsmk-gatekeeper/lib/marketplace';

const marketplace = inject(MarketplaceRegistry);

// Search marketplace
const results = await marketplace.searchPlugins({
  query: 'authentication',
  category: PluginCategory.Authentication,
  minRating: 4.0,
  sortBy: 'rating',
});

// Discover from npm
const plugins = await marketplace.discoverFromNpm('auth', 20);
```

### Manage Reviews

```typescript
// Add review
marketplace.addReview({
  id: 'review-1',
  pluginId: '@vendor/plugin',
  userId: 'user-123',
  rating: 5,
  comment: 'Great plugin!',
  timestamp: new Date().toISOString(),
});

// Get reviews
const reviews = marketplace.getReviews('@vendor/plugin');

// Get rating
const rating = marketplace.getRating('@vendor/plugin');
```

### Install Plugins

```typescript
import { PluginInstaller } from 'ngxsmk-gatekeeper/lib/marketplace';

const installer = new PluginInstaller();

// Get installation commands
const commands = installer.getInstallationCommands(plugin);
console.log(commands.npm); // npm install @vendor/plugin@1.0.0

// Check if installed
const isInstalled = await installer.isInstalled('@vendor/plugin');

// Check for updates
const updateInfo = await installer.getUpdateInfo(plugin);
```

## Plugin Registration

To register your plugin:

1. Publish to npm with `ngxsmk-gatekeeper` keyword
2. Implement `GatekeeperExtension` interface
3. Add metadata to package.json

See [Extension API](../extensions/PLUGIN_ARCHITECTURE.md) for details.

## API Reference

See [Marketplace API Documentation](../../../docs/marketplace/) for complete API reference.

