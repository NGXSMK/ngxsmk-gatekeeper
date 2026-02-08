/*
 * Public API Surface of ngxsmk-gatekeeper
 */

// Core middleware types
export type {
  MiddlewareContext,
  NgxMiddleware,
  MiddlewareResult,
  MiddlewareResponse,
  MiddlewareReturn,
} from './lib/core';

// Angular providers and configuration
export type { GatekeeperConfig, RouteGatekeeperConfig } from './lib/angular';
export { provideGatekeeper, withGatekeeper } from './lib/angular';

// Angular guards and interceptors
export { gatekeeperGuard, gatekeeperLoadGuard, GatekeeperGuard } from './lib/angular';
export { gatekeeperInterceptor, GatekeeperInterceptor } from './lib/angular';

// Helper utilities
export { createMiddleware, definePipeline, resolvePipelines, isPipeline } from './lib/helpers';
export type { MiddlewareHandler, NamedMiddleware, MiddlewarePipeline } from './lib/helpers';

// Feature flag providers
export type { FeatureFlagProvider } from './lib/providers';
export {
  FEATURE_FLAG_PROVIDER,
  provideFeatureFlagProvider,
  LocalStorageFeatureFlagProvider,
  RemoteApiFeatureFlagProvider,
} from './lib/providers';
export type { RemoteApiFeatureFlagProviderConfig } from './lib/providers';

// SSR adapter (optional - for Angular Universal support)
export type { SsrAdapterConfig } from './lib/angular';
export {
  provideSsrAdapter,
  SsrAdapter,
  SSR_ADAPTER,
} from './lib/angular';

// Benchmark utilities (optional - for performance monitoring)
export type {
  BenchmarkConfig,
  MiddlewareBenchmarkStats,
  ChainBenchmarkStats,
} from './lib/core/benchmark';
export {
  getBenchmarkStats,
  clearBenchmarkStats,
} from './lib/core/benchmark';

// Policy engine (optional - for enterprise policy management)
export type {
  Policy,
  PolicyEvaluator,
  PolicyRegistry,
} from './lib/policies';
export {
  policy,
  providePolicyRegistry,
  POLICY_REGISTRY,
  DefaultPolicyRegistry,
  createPolicyMiddleware,
} from './lib/policies';
export type { PolicyMiddlewareOptions } from './lib/policies';

// Permissions and role matrix (optional - for permission-based access control)
export {
  permissionMiddleware,
  parsePermission,
  matchesPermission,
  hasPermission,
  hasAllPermissions,
  resolveRoles,
  hasRole,
  hasAnyRole,
  hasAllRoles,
} from './lib/permissions';
export type {
  PermissionMiddlewareOptions,
  RoleHierarchy,
} from './lib/permissions';

// Audit logging (optional - for access decision logging)
export {
  createAuditMiddleware,
  logAuditDecision,
  ConsoleAuditSink,
  LocalStorageAuditSink,
  RemoteApiAuditSink,
  sanitizeObject,
  extractUserId,
} from './lib/audit';
export type {
  AuditLogEntry,
  AuditSink,
  AuditMiddlewareConfig,
  RemoteApiAuditSinkOptions,
} from './lib/audit';

// Zero Trust enforcement mode (optional - for enterprise security)
export { publicMiddleware } from './lib/zero-trust';

// Environment-aware middleware (optional - for environment-specific behavior)
export {
  environmentMiddleware,
  detectEnvironment,
  isDevelopment,
  isStaging,
  isProduction,
} from './lib/environment';
export type {
  Environment,
  EnvironmentConfig,
  EnvironmentMiddlewareOptions,
} from './lib/environment';

// Security headers (optional - for injecting headers into HTTP requests)
export {
  securityHeadersMiddleware,
  createSecurityHeaders,
  createCSP,
  createHSTS,
  createFrameOptions,
  createContentTypeOptions,
  createXSSProtection,
  createReferrerPolicy,
  createPermissionsPolicy,
} from './lib/security-headers';
export type {
  SecurityHeadersConfig,
  CommonSecurityHeadersOptions,
  CSPOptions,
  HSTSOptions,
  FrameOptionsValue,
  CSPDirectives,
} from './lib/security-headers';

// Tamper detection (optional - for detecting misconfiguration and tampering)
export {
  detectTampering,
  logTamperIssues,
  getExecutionOrderTracker,
} from './lib/tamper-detection';
export type {
  TamperDetectionConfig,
  TamperDetectionResult,
  TamperIssue,
} from './lib/tamper-detection';

// Compliance mode (optional - for SOC2, ISO 27001, and similar compliance frameworks)
export {
  ComplianceAuditSink,
  generateComplianceLog,
  formatComplianceLog,
  createExecutionTrace,
  createDecisionRationale,
  createCompliantMiddleware,
} from './lib/compliance';
export type {
  ComplianceConfig,
  ComplianceLogEntry,
  ComplianceExecutionTrace,
  ComplianceDecisionRationale,
} from './lib/compliance';

// Extension API (for plugin architecture)
export {
  provideExtensions,
  getExtensionRegistry,
  ExtensionRegistry,
} from './lib/extensions';
export type {
  GatekeeperExtension,
  ExtensionContext,
  ExtensionRegistration,
} from './lib/extensions';

// Adapter API (for enterprise authentication providers)
export {
  provideAdapters,
  getAdapterRegistry,
  createAdapterMiddleware,
  AdapterRegistry,
} from './lib/adapters';
export type {
  AuthAdapter,
  AuthResult,
  AuthUser,
  AdapterConfig,
  AdapterMiddlewareOptions,
} from './lib/adapters';

// License verification hook (optional - for enterprise plugins)
export {
  provideLicenseVerifiers,
  getLicenseRegistry,
  verifyLicense,
  createLicenseMiddleware,
  createLicenseFeatureMiddleware,
  LicenseRegistry,
} from './lib/license';
export type {
  LicenseVerifier,
  LicenseVerificationResult,
  LicenseMetadata,
  LicenseVerificationContext,
  LicenseVerificationOptions,
} from './lib/license';

// Diagnostics export (optional - for debugging and support)
export {
  collectDiagnostics,
  exportDiagnostics,
  downloadDiagnostics,
} from './lib/diagnostics';
export type {
  DiagnosticsInfo,
  DiagnosticsExportFormat,
  DiagnosticsExportOptions,
  MiddlewareDiagnostics,
  ExecutionOrderDiagnostics,
} from './lib/diagnostics';

// Built-in middleware (core)
export {
  createAuthMiddleware,
  createRoleMiddleware,
  createFeatureFlagMiddleware,
  createRateLimitMiddleware,
} from './lib/middlewares';
export type {
  AuthMiddlewareOptions,
  RoleMiddlewareOptions,
  FeatureFlagMiddlewareOptions,
  RateLimitMiddlewareOptions,
} from './lib/middlewares';

// Security middleware
export {
  createIPWhitelistMiddleware,
  createIPBlacklistMiddleware,
  createCSRFMiddleware,
  getCSRFToken,
  createSessionMiddleware,
  createAPIKeyMiddleware,
  createAccountLockoutMiddleware,
  createWebhookSignatureMiddleware,
  createDeviceFingerprintMiddleware,
  createUserAgentMiddleware,
  createBotProtectionMiddleware,
} from './lib/middlewares';
export type {
  IPWhitelistMiddlewareOptions,
  IPBlacklistMiddlewareOptions,
  CSRFMiddlewareOptions,
  SessionMiddlewareOptions,
  APIKeyMiddlewareOptions,
  AccountLockoutMiddlewareOptions,
  WebhookSignatureMiddlewareOptions,
  DeviceFingerprintMiddlewareOptions,
  UserAgentMiddlewareOptions,
  BotProtectionMiddlewareOptions,
} from './lib/middlewares';

// Access control middleware
export {
  createTimeWindowMiddleware,
  createMaintenanceModeMiddleware,
  createGeoBlockMiddleware,
} from './lib/middlewares';
export type {
  TimeWindowMiddlewareOptions,
  DayOfWeek,
  MaintenanceModeMiddlewareOptions,
  GeoBlockMiddlewareOptions,
} from './lib/middlewares';

// Authentication middleware
export {
  createMFAMiddleware,
  createOAuth2Middleware,
  createJWTRefreshMiddleware,
} from './lib/middlewares';
export type {
  MFAMiddlewareOptions,
  MFAMethod,
  OAuth2MiddlewareOptions,
  OAuth2Provider,
  JWTRefreshMiddlewareOptions,
} from './lib/middlewares';

// Request processing middleware
export {
  createRequestValidationMiddleware,
  createRequestSizeMiddleware,
  createRequestDeduplicationMiddleware,
  createAPIVersioningMiddleware,
} from './lib/middlewares';
export type {
  RequestValidationMiddlewareOptions,
  ValidationSchema,
  RequestSizeMiddlewareOptions,
  RequestDeduplicationMiddlewareOptions,
  APIVersioningMiddlewareOptions,
} from './lib/middlewares';

// Advanced control middleware
export {
  createConditionalMiddleware,
  createCircuitBreakerMiddleware,
  createRetryMiddleware,
  createConcurrentLimitMiddleware,
} from './lib/middlewares';
export type {
  ConditionalMiddlewareOptions,
  CircuitBreakerMiddlewareOptions,
  RetryMiddlewareOptions,
  BackoffStrategy,
  ConcurrentLimitMiddlewareOptions,
} from './lib/middlewares';

// Analytics & monitoring middleware
export {
  createAnalyticsMiddleware,
  createABTestMiddleware,
  createRequestLoggingMiddleware,
} from './lib/middlewares';
export type {
  AnalyticsMiddlewareOptions,
  AnalyticsEvent,
  AnalyticsSink,
  ABTestMiddlewareOptions,
  ABTest,
  ABTestVariant,
  RequestLoggingMiddlewareOptions,
  LogLevel,
  LogFormat,
} from './lib/middlewares';

// Performance middleware
export {
  createCacheMiddleware,
  createRequestBatchingMiddleware,
} from './lib/middlewares';
export type {
  CacheMiddlewareOptions,
  CacheStorage,
  RequestBatchingMiddlewareOptions,
} from './lib/middlewares';

// Marketplace API
export {
  MarketplaceRegistry,
  provideMarketplace,
  NpmClient,
  PluginInstaller,
} from './lib/marketplace';
export type {
  MarketplacePlugin,
  PluginCategory,
  PluginRating,
  PluginReview,
  MarketplaceSearchOptions,
  MarketplaceSearchResult,
  MarketplaceConfig,
  PluginInstallationResult,
} from './lib/marketplace';

// Configuration Validator
export {
  ConfigValidator,
  validateConfig,
  typeCheckConfig,
  analyzePerformance,
  analyzeSecurity,
  checkBestPractices,
} from './lib/validator';
export type {
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ValidationCategory,
  ValidatorOptions,
  PerformanceAnalysis,
  SecurityAnalysis,
} from './lib/validator';

// Template Library
export {
  TemplateRegistry,
  TemplateLoader,
  createTemplateLoader,
  loadBuiltInTemplates,
} from './lib/templates';
export type {
  Template,
  TemplateMetadata,
  TemplateConfig,
  TemplateFactory,
  TemplateCategory,
} from './lib/templates';
export {
  createBasicTemplate,
  createSaaSTemplate,
  createECommerceTemplate,
  createAPITemplate,
  createSecurityTemplate,
  createComplianceTemplate,
} from './lib/templates';
export type {
  BasicTemplateOptions,
  SaaSTemplateOptions,
  ECommerceTemplateOptions,
  APITemplateOptions,
  SecurityTemplateOptions,
  ComplianceTemplateOptions,
} from './lib/templates';

// Testing utilities
export {
  createMockContext,
  createAuthenticatedContext,
  createUnauthenticatedContext,
  createRoleContext,
  createHttpContext,
  createRouteContext,
  createMockContexts,
} from './lib/testing';
export type {
  MockUser,
  MockHttpRequest,
  MockRouteContext,
  MockContextOptions,
} from './lib/testing';

export {
  expectMiddlewareToAllow,
  expectMiddlewareToDeny,
  expectMiddlewareToRedirect,
  expectMiddlewareToCompleteWithin,
  expectMiddlewareResult,
  resolveMiddlewareResult,
  testMiddlewareResult,
} from './lib/testing';
export type {
  MiddlewareTestResult,
} from './lib/testing';

export {
  runMiddlewareChain,
  runMiddlewareChainTests,
  createMiddlewareTestSuite,
  expectChainResult,
} from './lib/testing';
export type {
  MiddlewareChainTestOptions,
  MiddlewareChainTestResult,
} from './lib/testing';

export {
  testMiddleware,
  testMiddlewareWithCases,
  createMiddlewareTester,
} from './lib/testing';
export type {
  MiddlewareTestCase,
} from './lib/testing';

// Visual Builder (optional - for visual middleware construction)
export {
  VisualBuilderService,
  createDefaultTemplateRegistry,
  createDefaultTemplates,
  generateCode,
  generateConfigCode,
  setDragData,
  getDragData,
  hasDragData,
  calculateDropPosition,
  snapToGrid,
} from './lib/visual-builder';
export {
  TemplateRegistry as VisualBuilderTemplateRegistry,
} from './lib/visual-builder';
export type {
  VisualNode,
  VisualConnection,
  VisualBuilderState,
  NodeType,
  MiddlewareTemplate,
  VisualBuilderConfig,
  VisualBuilderExport,
  VisualBuilderImportResult,
  NodeDragData,
  ConnectionValidationResult,
  BuilderActionType,
  BuilderAction,
  CodeGenerationOptions,
} from './lib/visual-builder';

// Showcase Gallery (optional - for user implementations and case studies)
export {
  ShowcaseService,
  getDefaultShowcaseEntries,
} from './lib/showcase';
export type {
  ShowcaseEntry,
  ShowcaseCategory,
  ImplementationType,
  CompanyInfo,
  AuthorInfo,
  CodeExample,
  ShowcaseImage,
  ShowcaseMetrics,
  ShowcaseFilterOptions,
  ShowcaseSearchResult,
  ShowcaseStats,
} from './lib/showcase';

// Observability (optional - for real-time monitoring and analytics)
export {
  ObservabilityService,
  ObservabilityWebSocketClient,
  provideObservability,
  createObservabilityHooks,
  InMemoryEventCollector,
} from './lib/observability';
export type {
  ObservabilityEventType,
  ObservabilityEventUnion,
  MiddlewareExecutionEvent,
  ChainExecutionEvent,
  ErrorEvent,
  MetricEvent,
  AnalyticsObservabilityEvent,
  HealthEvent,
  WebSocketMessageType,
  WebSocketMessage,
  SubscribeRequest,
  AggregatedStats,
  DashboardConfig,
  EventCollector,
  WebSocketClientOptions,
  WebSocketClientHandlers,
  ObservabilityIntegrationOptions,
} from './lib/observability';

// Agent mode
export * from './lib/agent';
