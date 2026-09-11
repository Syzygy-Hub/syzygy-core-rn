# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-11

### Fixed

- **FIX 7** — `LogDestination.write()` now accepts optional `timestamp` and `error` params; `ConsoleLogDestination` prints timestamp prefix and error stack when present; `Logger.log(LogEntry)` forwards `entry.timestamp` and `entry.error`; removed stale duplicate JSDoc block before `log()` overloads
- **FIX 8** — Added test coverage for `log(LogEntry)` Foundation path: all 5 Foundation log levels, metadata forwarding, timestamp forwarding, error forwarding, and `error()`/`critical()` convenience method Error params
- **FIX 9** — `Throttler` now accepts an injectable `clock: () => number` parameter (defaults to `Date.now`) for deterministic testing; added post-cooldown execution test
- **FIX 11** — `EventBus.publish()` now wraps each handler in `queueMicrotask()` so handlers execute asynchronously and errors in one handler do not prevent others from running; each handler invocation is guarded with try/catch
- **FIX 13** — `DeepLinkParser.parse()` strips query strings and URL fragments before pattern matching; tests added for `?query`, `#fragment`, and combined forms
- **FIX 14** — `Router.popToRoot()` now runs the guard chain before executing; guard blocks popToRoot test added
- **FIX 16** — Added JSDoc documenting scoped-through-parent behavior on `Container`; tests for two child containers getting independent scoped instances and scoped-through-parent caching
- **FIX 17** — Added `dispose()` to `EventBus`, `StateStore`, and `Container`; dispose clears state and throws on further use; tests verify cleanup and post-dispose errors
- **FIX 20** — `EmailValidator` JSDoc documents heuristic pattern and non-RFC-5321-compliance
- **FIX 22** — `InMemoryFeatureFlagProvider` and `ConfigRegistry` replace unchecked `as T` casts with type-guard checks that throw a descriptive error on type mismatch
- **FIX 24** — `AppLifecycleTracker.fromAppState()` factory method wires to React Native `AppState.addEventListener`; JSDoc examples added; README updated with "Wiring to React Native AppState" section

## [1.0.0] - 2026-09-05

### Added

- DI container with singleton, transient, and scoped lifetimes
- Reactive state stores with reducers and selectors
- Typed event bus with scoped subscriptions and async dispatch
- Logger with log levels, formatters, and pluggable destinations
- Feature flag provider with evaluation rules, local overrides, and A/B variants
- Navigation router with deep link parsing and route guards
- Composable validation pipeline with built-in rules
- Configuration registry with environment-based switching
- App lifecycle tracker with lifecycle-aware scoping
- Scheduling utilities — debounce, throttle, delayed execution, cancellable timers

[1.1.0]: https://github.com/Syzygy-Hub/syzygy-core-rn/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/Syzygy-Hub/syzygy-core-rn/releases/tag/1.0.0
