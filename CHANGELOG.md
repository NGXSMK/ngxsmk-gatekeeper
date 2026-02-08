# Changelog

## [1.1.0] - 2026-02-08

### Added
- **Agent Mode**: Introduced a new autonomous security agent (`GatekeeperAgentService`) that monitors application security posture in real-time.
  - Supports multiple modes: `monitor`, `enforce`, `strict`, `panic`.
  - Automatically runs security scans on startup.
  - Monitors error rates and traffic anomalies.
- **Agent Provider**: Added `provideGatekeeperAgent` for easy configuration in `app.config.ts`.

### Fixed
- Fixed issue with `inlineSources` in `tsconfig.lib.json` by enabling `sourceMap`.

## [1.0.0] - 2026-01-01

### Added
- Initial release of ngxsmk-gatekeeper.
