/**
 * Visual builder service
 * 
 * Manages the state and operations of the visual middleware builder
 */

import { Injectable, Inject, Optional, signal, WritableSignal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  VisualBuilderState,
  VisualNode,
  VisualConnection,
  NodeType,
  VisualBuilderConfig,
  VisualBuilderExport,
  VisualBuilderImportResult,
  ConnectionValidationResult,
  BuilderAction,
  BuilderActionType,
} from './visual-builder.types';
import { NgxMiddleware } from '../core';
import { MiddlewarePipeline, resolvePipelines } from '../helpers';

/**
 * Visual builder service
 */
@Injectable({
  providedIn: 'root',
})
export class VisualBuilderService {
  private stateSubject = new BehaviorSubject<VisualBuilderState>(this.createInitialState());
  private history: BuilderAction[] = [];
  private historyIndex = -1;

  /** Signal of builder state */
  readonly stateSignal: WritableSignal<VisualBuilderState> = signal<VisualBuilderState>(this.createInitialState());

  /** Observable of builder state */
  readonly state$: Observable<VisualBuilderState> = this.stateSubject.asObservable();

  /** Current state */
  get state(): VisualBuilderState {
    return this.stateSignal();
  }

  constructor(@Optional() @Inject('VisualBuilderConfig') config?: VisualBuilderConfig) {
    // Config is stored but not used in current implementation
    void config;
  }

  /**
   * Add a node to the builder
   */
  addNode(node: Omit<VisualNode, 'id'>): string {
    const newNode: VisualNode = {
      ...node,
      id: this.generateNodeId(),
    };

    this.dispatchAction({
      type: BuilderActionType.ADD_NODE,
      payload: newNode,
      timestamp: Date.now(),
    });

    return newNode.id;
  }

  /**
   * Remove a node
   */
  removeNode(nodeId: string): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return;
    }

    const connectionsToRemove = this.state.connections.filter(
      (c) => c.sourceId === nodeId || c.targetId === nodeId
    );
    connectionsToRemove.forEach((c) => this.removeConnection(c.id));

    this.dispatchAction({
      type: BuilderActionType.REMOVE_NODE,
      payload: { nodeId },
      timestamp: Date.now(),
    });
  }

  /**
   * Update a node
   */
  updateNode(nodeId: string, updates: Partial<VisualNode>): void {
    const node = this.state.nodes.find((n) => n.id === nodeId);
    if (!node) {
      return;
    }

    this.dispatchAction({
      type: BuilderActionType.UPDATE_NODE,
      payload: { nodeId, updates },
      timestamp: Date.now(),
    });
  }

  /**
   * Add a connection between nodes
   */
  addConnection(
    sourceId: string,
    targetId: string,
    type: 'success' | 'failure' | 'default' = 'default',
    label?: string
  ): string | null {
    // Validate connection
    const validation = this.validateConnection(sourceId, targetId);
    if (!validation.valid) {
      console.warn('Invalid connection:', validation.error);
      return null;
    }

    const connection: VisualConnection = {
      id: this.generateConnectionId(),
      sourceId,
      targetId,
      type,
      ...(label !== undefined && { label }),
    };

    this.dispatchAction({
      type: BuilderActionType.ADD_CONNECTION,
      payload: connection,
      timestamp: Date.now(),
    });

    return connection.id;
  }

  /**
   * Remove a connection
   */
  removeConnection(connectionId: string): void {
    this.dispatchAction({
      type: BuilderActionType.REMOVE_CONNECTION,
      payload: { connectionId },
      timestamp: Date.now(),
    });
  }

  /**
   * Select a node
   */
  selectNode(nodeId: string, multiSelect = false): void {
    if (multiSelect) {
      const selected = [...this.state.selectedNodes];
      if (!selected.includes(nodeId)) {
        selected.push(nodeId);
      }
      this.updateState({ selectedNodes: selected });
    } else {
      this.dispatchAction({
        type: BuilderActionType.SELECT_NODE,
        payload: { nodeId },
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Deselect a node
   */
  deselectNode(nodeId: string): void {
    this.dispatchAction({
      type: BuilderActionType.DESELECT_NODE,
      payload: { nodeId },
      timestamp: Date.now(),
    });
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.dispatchAction({
      type: BuilderActionType.CLEAR_SELECTION,
      timestamp: Date.now(),
    });
  }

  /**
   * Update zoom level
   */
  setZoom(zoom: number): void {
    this.dispatchAction({
      type: BuilderActionType.ZOOM,
      payload: { zoom },
      timestamp: Date.now(),
    });
  }

  /**
   * Update pan offset
   */
  setPan(pan: { x: number; y: number }): void {
    this.dispatchAction({
      type: BuilderActionType.PAN,
      payload: { pan },
      timestamp: Date.now(),
    });
  }

  /**
   * Reset view
   */
  resetView(): void {
    this.dispatchAction({
      type: BuilderActionType.RESET_VIEW,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate middleware chain from visual builder
   */
  generateMiddlewareChain(): NgxMiddleware[] {
    const { nodes, connections } = this.state;

    // Find start node
    const startNode = nodes.find((n) => n.type === NodeType.START);
    if (!startNode) {
      throw new Error('No start node found');
    }

    // Build execution order using topological sort
    const executionOrder: VisualNode[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (nodeId: string) => {
      if (visiting.has(nodeId)) {
        throw new Error('Circular dependency detected');
      }
      if (visited.has(nodeId)) {
        return;
      }

      visiting.add(nodeId);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) {
        return;
      }

      // Visit all target nodes
      const outgoingConnections = connections.filter((c) => c.sourceId === nodeId);
      outgoingConnections.forEach((c) => {
        if (c.type === 'success' || c.type === 'default') {
          visit(c.targetId);
        }
      });

      visiting.delete(nodeId);
      visited.add(nodeId);
      executionOrder.push(node);
    };

    visit(startNode.id);

    // Convert to middleware array
    const middlewares: NgxMiddleware[] = [];
    executionOrder.forEach((node) => {
      if (node.type === NodeType.MIDDLEWARE && node.middleware) {
        middlewares.push(node.middleware);
      } else if (node.type === NodeType.PIPELINE && node.pipeline) {
        const resolved = resolvePipelines([node.pipeline]);
        middlewares.push(...resolved);
      }
    });

    return middlewares;
  }

  /**
   * Generate pipeline from visual builder
   */
  generatePipeline(_name: string): MiddlewarePipeline {
    const middlewares = this.generateMiddlewareChain();
    return {
      middlewares,
    } as MiddlewarePipeline & { name: string };
  }

  /**
   * Export builder state
   */
  export(): VisualBuilderExport {
    return {
      version: '1.1.0',
      state: this.state,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Import builder state
   */
  import(exportData: VisualBuilderExport): VisualBuilderImportResult {
    try {
      // Validate export data
      if (!exportData.state || !exportData.state.nodes || !exportData.state.connections) {
        return {
          success: false,
          error: 'Invalid export format',
        };
      }

      // Update state
      this.updateState(exportData.state);

      return {
        success: true,
        state: this.state,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Undo last action
   */
  undo(): void {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.applyHistory();
    }
  }

  /**
   * Redo last action
   */
  redo(): void {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.applyHistory();
    }
  }

  /**
   * Clear all nodes and connections
   */
  clear(): void {
    this.updateState(this.createInitialState());
    this.history = [];
    this.historyIndex = -1;
  }

  /**
   * Validate a connection
   */
  private validateConnection(sourceId: string, targetId: string): ConnectionValidationResult {
    if (sourceId === targetId) {
      return {
        valid: false,
        error: 'Cannot connect node to itself',
      };
    }

    const sourceNode = this.state.nodes.find((n) => n.id === sourceId);
    const targetNode = this.state.nodes.find((n) => n.id === targetId);

    if (!sourceNode || !targetNode) {
      return {
        valid: false,
        error: 'Source or target node not found',
      };
    }

    // Check for duplicate connection
    const existing = this.state.connections.find(
      (c) => c.sourceId === sourceId && c.targetId === targetId
    );
    if (existing) {
      return {
        valid: false,
        error: 'Connection already exists',
      };
    }

    // Check for cycles (basic check)
    if (this.wouldCreateCycle(sourceId, targetId)) {
      return {
        valid: false,
        error: 'Connection would create a cycle',
      };
    }

    return { valid: true };
  }

  /**
   * Check if connection would create a cycle
   */
  private wouldCreateCycle(sourceId: string, targetId: string): boolean {
    // Simple cycle detection: check if target can reach source
    const visited = new Set<string>();
    const queue = [targetId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (currentId === sourceId) {
        return true;
      }
      if (visited.has(currentId)) {
        continue;
      }
      visited.add(currentId);

      const outgoingConnections = this.state.connections.filter((c) => c.sourceId === currentId);
      outgoingConnections.forEach((c) => {
        if (!visited.has(c.targetId)) {
          queue.push(c.targetId);
        }
      });
    }

    return false;
  }

  /**
   * Dispatch an action
   */
  private dispatchAction(action: BuilderAction): void {
    // Apply action
    this.applyAction(action);

    // Add to history
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(action);
    this.historyIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > 100) {
      this.history = this.history.slice(-100);
      this.historyIndex = this.history.length - 1;
    }
  }

  /**
   * Apply an action
   */
  private applyAction(action: BuilderAction): void {
    const currentState = this.state;
    let newState: Partial<VisualBuilderState> = {};

    switch (action.type) {
      case BuilderActionType.ADD_NODE:
        newState = {
          nodes: [...currentState.nodes, action.payload as VisualNode],
        };
        break;

      case BuilderActionType.REMOVE_NODE:
        const { nodeId } = action.payload as { nodeId: string };
        newState = {
          nodes: currentState.nodes.filter((n) => n.id !== nodeId),
        };
        break;

      case BuilderActionType.UPDATE_NODE:
        const { nodeId: updateNodeId, updates } = action.payload as {
          nodeId: string;
          updates: Partial<VisualNode>;
        };
        newState = {
          nodes: currentState.nodes.map((n) =>
            n.id === updateNodeId ? { ...n, ...updates } : n
          ),
        };
        break;

      case BuilderActionType.ADD_CONNECTION:
        newState = {
          connections: [...currentState.connections, action.payload as VisualConnection],
        };
        break;

      case BuilderActionType.REMOVE_CONNECTION:
        const { connectionId } = action.payload as { connectionId: string };
        newState = {
          connections: currentState.connections.filter((c) => c.id !== connectionId),
        };
        break;

      case BuilderActionType.SELECT_NODE:
        const { nodeId: selectNodeId } = action.payload as { nodeId: string };
        newState = {
          selectedNodes: [selectNodeId],
        };
        break;

      case BuilderActionType.DESELECT_NODE:
        const { nodeId: deselectNodeId } = action.payload as { nodeId: string };
        newState = {
          selectedNodes: currentState.selectedNodes.filter((id) => id !== deselectNodeId),
        };
        break;

      case BuilderActionType.CLEAR_SELECTION:
        newState = {
          selectedNodes: [],
        };
        break;

      case BuilderActionType.ZOOM:
        const { zoom } = action.payload as { zoom: number };
        newState = { zoom };
        break;

      case BuilderActionType.PAN:
        const { pan } = action.payload as { pan: { x: number; y: number } };
        newState = { pan };
        break;

      case BuilderActionType.RESET_VIEW:
        newState = {
          zoom: 1,
          pan: { x: 0, y: 0 },
        };
        break;
    }

    this.updateState(newState);
  }

  /**
   * Apply history
   */
  private applyHistory(): void {
    const newState = this.createInitialState();
    for (let i = 0; i <= this.historyIndex; i++) {
      void this.history[i];
    }
    this.updateState(newState);
  }

  /**
   * Update state
   */
  private updateState(updates: Partial<VisualBuilderState>): void {
    const currentState = this.stateSignal();
    const newState = { ...currentState, ...updates };
    this.stateSubject.next(newState);
    this.stateSignal.set(newState);
  }

  /**
   * Create initial state
   */
  private createInitialState(): VisualBuilderState {
    const startNode: VisualNode = {
      id: 'start',
      type: NodeType.START,
      label: 'Start',
      position: { x: 100, y: 100 },
      size: { width: 120, height: 60 },
      metadata: {
        icon: 'play',
        color: '#4caf50',
      },
    };

    return {
      nodes: [startNode],
      connections: [],
      selectedNodes: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
      viewport: { width: 800, height: 600 },
    };
  }

  /**
   * Generate unique node ID
   */
  private generateNodeId(): string {
    return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

