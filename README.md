[![React Native](https://img.shields.io/badge/RN-TypeScript-7F77DD?style=flat)](https://reactnative.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white&style=flat)](https://www.typescriptlang.org/) [![CI](https://img.shields.io/github/actions/workflow/status/Syzygy-Hub/syzygy-core-rn/ci.yml?label=ci&style=flat)](https://github.com/Syzygy-Hub/syzygy-core-rn/actions/workflows/ci.yml) [![npm](https://img.shields.io/badge/version-1.1.0-D85A30?style=flat)](https://www.npmjs.com/package/syzygy-core-rn) [![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Syzygy-Hub/.github/main/brand/assets/banners/syzygy-banner-dark-1200.png">
  <img src="https://raw.githubusercontent.com/Syzygy-Hub/.github/main/brand/assets/banners/syzygy-banner-light-1200.png" alt="Syzygy" width="600">
</picture>

# syzygy-core-rn

Core infrastructure modules for the Syzygy React Native ecosystem — dependency injection, state management, event bus, logging, feature flags, navigation, validation, configuration, app lifecycle, and scheduling.

---

## Modules

| Module | Description |
|---|---|
| **DI** | Dependency injection container with singleton, transient, and scoped lifetimes |
| **State** | Reactive state stores, observable properties, state reducers, and selectors |
| **EventBus** | Typed publish/subscribe channels with scoped subscriptions and async dispatch |
| **Logging** | Log levels, formatters, pipeline routing, and pluggable destinations |
| **FeatureFlags** | Evaluation rules, flag definitions, local overrides, and A/B variant selection |
| **Navigation** | Route definitions, deep link URL parsing, navigation stack model, and route guards |
| **Validation** | Composable field validators, rule chaining, and form-level validation pipeline |
| **Configuration** | In-memory config registry, environment-based switching, and typed config access |
| **Lifecycle** | Foreground/background state tracking, lifecycle observers, and lifecycle-aware scoping |
| **Scheduling** | Debounce, throttle, delayed execution, and cancellable timers |

---

## Installation

```bash
npm install syzygy-core-rn
```

---

## Requirements

- Node.js 20+
- TypeScript 5.4+

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| [syzygy-foundation-rn](https://github.com/Syzygy-Hub/syzygy-foundation-rn) | ^1.1.0 | Foundation contracts, primitives, and shared types |

---

## Lifecycle

### Wiring to React Native AppState

Use `AppLifecycleTracker.fromAppState(AppState)` to wire the tracker directly to React Native's `AppState`, so lifecycle transitions are forwarded automatically.

```typescript
import { AppState } from 'react-native';
import { AppLifecycleTracker } from 'syzygy-core-rn';

const { tracker, remove } = AppLifecycleTracker.fromAppState(AppState);

tracker.addObserver({
  onLifecycleChange: (state) => {
    console.log('App lifecycle changed to:', state);
  },
});

// When the component unmounts, stop listening:
remove();
```

The factory seeds the tracker with the current `AppState.currentState` value and subscribes to future changes via `AppState.addEventListener('change', ...)`. Call `remove()` to unsubscribe and avoid memory leaks.

---

## Ecosystem

This repo is part of the **Syzygy** cross-platform mobile ecosystem. See the [ecosystem architecture](https://github.com/Syzygy-Hub/.github/blob/main/engineering/architecture/syzygy-ecosystem.md) for how the layers fit together.

---

## License

MIT — see [LICENSE](LICENSE) for details.
