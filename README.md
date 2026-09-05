<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Syzygy-Hub/.github/main/brand/assets/banners/syzygy-banner-dark-1200.png">
  <img src="https://raw.githubusercontent.com/Syzygy-Hub/.github/main/brand/assets/banners/syzygy-banner-light-1200.png" alt="Syzygy" width="600">
</picture>

# syzygy-core-rn

[![React Native](https://img.shields.io/badge/RN-TypeScript-7F77DD?style=flat)](https://reactnative.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white&style=flat)](https://www.typescriptlang.org/) [![CI](https://img.shields.io/github/actions/workflow/status/Syzygy-Hub/syzygy-core-rn/ci.yml?label=ci&style=flat)](https://github.com/Syzygy-Hub/syzygy-core-rn/actions/workflows/ci.yml) [![npm](https://img.shields.io/badge/version-1.0.0-D85A30?style=flat)](https://www.npmjs.com/package/syzygy-core-rn) [![License](https://img.shields.io/badge/License-MIT-green?style=flat)](LICENSE)

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

## Ecosystem

This repo is part of the **Syzygy** cross-platform mobile ecosystem. See the [ecosystem architecture](https://github.com/Syzygy-Hub/.github/blob/main/engineering/architecture/syzygy-ecosystem.md) for how the layers fit together.

---

## License

MIT — see [LICENSE](LICENSE) for details.
