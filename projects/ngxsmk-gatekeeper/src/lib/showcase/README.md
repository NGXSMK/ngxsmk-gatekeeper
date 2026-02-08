# Showcase Module

Gallery system for user implementations and case studies.

## Overview

The showcase module provides:

- Showcase entry management
- Search and filtering
- Statistics and analytics
- Category and type organization

## Components

### ShowcaseService

Main service for managing showcase entries.

```typescript
import { ShowcaseService } from 'ngxsmk-gatekeeper/lib/showcase';

const service = inject(ShowcaseService);

// Get all entries
const entries$ = service.getAllEntries();

// Search
const result$ = service.search({
  category: ShowcaseCategory.ECOMMERCE,
  search: 'payment',
});

// Get statistics
const stats$ = service.getStats();
```

### ShowcaseEntry

Entry structure for case studies and implementations.

```typescript
import { ShowcaseEntry, ShowcaseCategory, ImplementationType } from 'ngxsmk-gatekeeper/lib/showcase';

const entry: ShowcaseEntry = {
  id: 'my-implementation',
  title: 'My Implementation',
  description: 'Description',
  category: ShowcaseCategory.SAAS,
  type: ImplementationType.CASE_STUDY,
  tags: ['saas', 'security'],
  publishedAt: new Date().toISOString(),
};
```

## Usage

### Basic Setup (with Signals)

```typescript
import { ShowcaseService } from 'ngxsmk-gatekeeper/lib/showcase';
import { Component } from '@angular/core';

@Component({
  selector: 'app-showcase',
  template: `
    <div *ngFor="let entry of entries()">
      <h3>{{ entry.title }}</h3>
    </div>
  `,
})
export class ShowcaseComponent {
  entries = this.showcaseService.entries;

  constructor(private showcaseService: ShowcaseService) {}
}
```

### Search and Filter

```typescript
const result$ = this.showcaseService.search({
  category: ShowcaseCategory.ECOMMERCE,
  type: ImplementationType.CASE_STUDY,
  search: 'payment',
  featured: true,
  sortBy: 'date',
  sortOrder: 'desc',
  limit: 10,
});
```

## See Also

- [Showcase Documentation](../../../../docs/showcase/)
- [Component Example](./showcase.component.example.ts)

