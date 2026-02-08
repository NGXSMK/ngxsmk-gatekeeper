# Visual Builder Module

Web-based visual middleware builder with drag-and-drop interface.

## Overview

The visual builder module provides:

- Visual node-based editor for middleware chains
- Drag-and-drop interface
- Template library for common middleware
- Code generation from visual representation
- Export/import functionality

## Components

### VisualBuilderService

Main service managing builder state and operations.

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';

const service = new VisualBuilderService();

// Add node
const nodeId = service.addNode({
  type: NodeType.MIDDLEWARE,
  label: 'Auth',
  position: { x: 100, y: 100 },
  size: { width: 200, height: 100 },
});

// Add connection
service.addConnection(sourceId, targetId);

// Generate code
const middlewares = service.generateMiddlewareChain();
```

### TemplateRegistry

Registry for middleware templates.

```typescript
import { TemplateRegistry, createDefaultTemplateRegistry } from 'ngxsmk-gatekeeper/lib/visual-builder';

const registry = createDefaultTemplateRegistry();
const templates = registry.getAll();
```

### Code Generator

Generate TypeScript code from builder state.

```typescript
import { generateCode } from 'ngxsmk-gatekeeper/lib/visual-builder';

const code = generateCode(state, {
  pipelineName: 'myPipeline',
  exportFormat: 'pipeline',
});
```

## Usage

### Basic Setup (with Signals)

```typescript
import { VisualBuilderService } from 'ngxsmk-gatekeeper/lib/visual-builder';
import { Component, effect } from '@angular/core';

@Component({/*...*/})
export class BuilderComponent {
  state = this.builderService.stateSignal;

  constructor(private builderService: VisualBuilderService) {
    effect(() => {
      console.log('Builder State:', this.state());
    });
  }
}
```

### Drag and Drop

```typescript
import { setDragData, getDragData } from 'ngxsmk-gatekeeper/lib/visual-builder';

// On drag start
onDragStart(event: DragEvent, template: MiddlewareTemplate) {
  setDragData(event, {
    type: 'template',
    templateId: template.id,
  });
}

// On drop
onDrop(event: DragEvent) {
  const data = getDragData(event);
  if (data?.type === 'template') {
    // Create node from template
  }
}
```

## See Also

- [Visual Builder Documentation](../../../../docs/visual-builder/)
- [Component Example](./visual-builder.component.example.ts)

