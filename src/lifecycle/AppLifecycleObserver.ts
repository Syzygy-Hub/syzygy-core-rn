// App Lifecycle
// Foreground/background state tracking, lifecycle observers, lifecycle-aware scoping.

export enum AppLifecycleState {
  Active = 'active',
  Inactive = 'inactive',
  Background = 'background',
}

export interface AppLifecycleObserver {
  onStateChange(state: AppLifecycleState): void;
}

export class AppLifecycleTracker {
  // TODO: observer registry, state tracking, lifecycle-aware scoping
}
