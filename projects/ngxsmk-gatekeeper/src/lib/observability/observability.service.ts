/**
 * Observability service
 * 
 * Integrates with middleware execution to collect and stream observability events
 */

import { Injectable, Optional, Inject, signal, WritableSignal } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import {
  ObservabilityEventType,
  ObservabilityEventUnion,
  MiddlewareExecutionEvent,
  ChainExecutionEvent,
  ErrorEvent,
  MetricEvent,
  DashboardConfig,
  AggregatedStats,
} from './observability.types';
import { EventCollector, InMemoryEventCollector, sanitizeContext } from './observability.collector';
import { ObservabilityWebSocketClient, WebSocketClientHandlers } from './websocket.client';
import { MiddlewareContext } from '../core';

/**
 * Observability service
 */
@Injectable({
  providedIn: 'root',
})
export class ObservabilityService {
  private collector: EventCollector;
  private wsClient: ObservabilityWebSocketClient | null = null;
  private config: DashboardConfig;
  private sessionId: string;
  private eventSubject = new Subject<ObservabilityEventUnion>();
  private statsSubject = new BehaviorSubject<AggregatedStats | null>(null);
  private connectedSubject = new BehaviorSubject<boolean>(false);

  /** Signal for aggregated stats */
  readonly stats: WritableSignal<AggregatedStats | null> = signal<AggregatedStats | null>(null);

  /** Signal for connection status */
  readonly connected: WritableSignal<boolean> = signal<boolean>(false);

  /** Observable stream of events */
  readonly events$: Observable<ObservabilityEventUnion> = this.eventSubject.asObservable();

  /** Observable stream of aggregated stats */
  readonly stats$: Observable<AggregatedStats | null> = this.statsSubject.asObservable();

  /** Observable stream of connection status */
  readonly connected$: Observable<boolean> = this.connectedSubject.asObservable();

  constructor(@Optional() @Inject('DashboardConfig') config?: DashboardConfig) {
    this.config = config ?? {};
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.collector = new InMemoryEventCollector(this.config.maxEvents ?? 1000);

    if (this.config.autoConnect !== false && this.config.websocketUrl) {
      this.connect();
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (!this.config.websocketUrl) {
      console.warn('Observability: WebSocket URL not configured');
      return;
    }

    if (this.wsClient) {
      return;
    }

    const handlers: WebSocketClientHandlers = {
      onOpen: () => {
        this.connectedSubject.next(true);
        this.connected.set(true);
        console.log('Observability: Connected to WebSocket server');
      },
      onClose: () => {
        this.connectedSubject.next(false);
        this.connected.set(false);
        console.log('Observability: Disconnected from WebSocket server');
      },
      onError: (error) => {
        console.error('Observability: WebSocket error:', error);
      },
      onEvent: (event) => {
        this.eventSubject.next(event);
      },
      onStats: (stats) => {
        this.statsSubject.next(stats);
        this.stats.set(stats);
      },
    };

    this.wsClient = new ObservabilityWebSocketClient(
      {
        url: this.config.websocketUrl,
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
      },
      handlers
    );

    this.wsClient.connect();

    // Subscribe to all events
    this.wsClient.subscribe({
      eventTypes: Object.values(ObservabilityEventType),
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.wsClient) {
      this.wsClient.disconnect();
      this.wsClient = null;
      this.connectedSubject.next(false);
      this.connected.set(false);
    }
  }

  /**
   * Record middleware execution start
   */
  recordMiddlewareStart(
    middlewareName: string,
    middlewareIndex: number,
    context: MiddlewareContext,
    contextType: 'route' | 'http',
    contextPath?: string
  ): void {
    const event: MiddlewareExecutionEvent = {
      type: ObservabilityEventType.MIDDLEWARE_START,
      timestamp: Date.now(),
      id: this.generateEventId(),
      sessionId: this.sessionId,
      middlewareName,
      middlewareIndex,
      contextType,
      ...(contextPath !== undefined && { contextPath }),
      context: sanitizeContext(context),
    };

    this.emitEvent(event);
  }

  /**
   * Record middleware execution end
   */
  recordMiddlewareEnd(
    middlewareName: string,
    middlewareIndex: number,
    context: MiddlewareContext,
    contextType: 'route' | 'http',
    contextPath: string | undefined,
    result: boolean,
    duration: number,
    error?: string
  ): void {
    const event: MiddlewareExecutionEvent = {
      type: ObservabilityEventType.MIDDLEWARE_END,
      timestamp: Date.now(),
      id: this.generateEventId(),
      sessionId: this.sessionId,
      middlewareName,
      middlewareIndex,
      contextType,
      ...(contextPath !== undefined && { contextPath }),
      result,
      duration,
      ...(error !== undefined && { error }),
      context: sanitizeContext(context),
    };

    this.emitEvent(event);
  }

  /**
   * Record chain execution start
   */
  recordChainStart(
    _context: MiddlewareContext,
    contextType: 'route' | 'http',
    contextPath: string | undefined,
    middlewareCount: number
  ): void {
    const event: ChainExecutionEvent = {
      type: ObservabilityEventType.CHAIN_START,
      timestamp: Date.now(),
      id: this.generateEventId(),
      sessionId: this.sessionId,
      contextType,
      ...(contextPath !== undefined && { contextPath }),
      middlewareCount,
    };

    this.emitEvent(event);
  }

  /**
   * Record chain execution end
   */
  recordChainEnd(
    _context: MiddlewareContext,
    contextType: 'route' | 'http',
    contextPath: string | undefined,
    result: boolean,
    stoppedAt: number,
    totalDuration: number,
    redirect?: string,
    middlewareExecutions?: Array<{
      name: string;
      index: number;
      duration: number;
      result: boolean;
      error?: string;
    }>
  ): void {
    const event: ChainExecutionEvent = {
      type: ObservabilityEventType.CHAIN_END,
      timestamp: Date.now(),
      id: this.generateEventId(),
      sessionId: this.sessionId,
      contextType,
      ...(contextPath !== undefined && { contextPath }),
      result,
      stoppedAt,
      totalDuration,
      ...(redirect !== undefined && { redirect }),
      ...(middlewareExecutions !== undefined && { middlewareExecutions }),
    };

    this.emitEvent(event);
  }

  /**
   * Record error
   */
  recordError(
    message: string,
    stack: string | undefined,
    source: 'middleware' | 'chain' | 'system',
    context?: Record<string, unknown>
  ): void {
    const event: ErrorEvent = {
      type: ObservabilityEventType.ERROR,
      timestamp: Date.now(),
      id: this.generateEventId(),
      sessionId: this.sessionId,
      message,
      ...(stack !== undefined && { stack }),
      source,
      ...(context !== undefined && { context }),
    };

    this.emitEvent(event);
  }

  /**
   * Record metric
   */
  recordMetric(
    metricName: string,
    value: number,
    unit?: string,
    tags?: Record<string, string>
  ): void {
    const event: MetricEvent = {
      type: ObservabilityEventType.METRIC,
      timestamp: Date.now(),
      id: this.generateEventId(),
      sessionId: this.sessionId,
      metricName,
      value,
      ...(unit !== undefined && { unit }),
      ...(tags !== undefined && { tags }),
    };

    this.emitEvent(event);
  }

  /**
   * Get aggregated statistics
   */
  getStats(timeRange?: { start: number; end: number }): AggregatedStats {
    return this.collector.getStats(timeRange);
  }

  /**
   * Get recent events
   */
  getRecentEvents(limit?: number): ObservabilityEventUnion[] {
    return this.collector.getRecentEvents(limit);
  }

  /**
   * Request stats from WebSocket server
   */
  requestStats(timeRange?: { start: number; end: number }): void {
    if (this.wsClient) {
      this.wsClient.requestStats(timeRange);
    }
  }

  /**
   * Clear collected events
   */
  clear(): void {
    this.collector.clear();
  }

  /**
   * Emit event to collector and WebSocket
   */
  private emitEvent(event: ObservabilityEventUnion): void {
    // Collect locally
    this.collector.collect(event);

    // Emit to subscribers
    this.eventSubject.next(event);

    // Send to WebSocket server if connected
    // (The server will handle broadcasting to other clients)
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

