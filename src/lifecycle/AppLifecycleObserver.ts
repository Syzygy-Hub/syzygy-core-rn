/**
 * Application lifecycle state tracking with observer pattern.
 */

/** Possible application lifecycle states. */
export enum AppLifecycleState {
  Active = 'active',
  Inactive = 'inactive',
  Background = 'background',
  Terminated = 'terminated',
}

/** Observer that receives lifecycle state changes. */
export interface AppLifecycleObserver {
  /** Called when the application lifecycle state changes. */
  onLifecycleChange(state: AppLifecycleState): void;
}

/**
 * Minimal subset of React Native's AppState API required for wiring.
 * Pass a real `AppState` object from `react-native` at the call site.
 */
export interface RNAppState {
  currentState: string;
  addEventListener(
    type: 'change',
    handler: (state: string) => void,
  ): { remove(): void };
}

/**
 * Tracks the application lifecycle state and notifies observers of transitions.
 *
 * @example
 * ```typescript
 * const tracker = new AppLifecycleTracker();
 * tracker.addObserver({ onLifecycleChange: (s) => console.log(s) });
 * tracker.transition(AppLifecycleState.Background);
 * ```
 *
 * @example Wiring to React Native AppState:
 * ```typescript
 * import { AppState } from 'react-native';
 * const tracker = AppLifecycleTracker.fromAppState(AppState);
 * tracker.addObserver({ onLifecycleChange: (s) => console.log('Lifecycle:', s) });
 * ```
 */
export class AppLifecycleTracker {
  private state: AppLifecycleState = AppLifecycleState.Active;
  private observers = new Set<AppLifecycleObserver>();

  /** The current lifecycle state. */
  get currentState(): AppLifecycleState {
    return this.state;
  }

  /**
   * Add an observer to receive lifecycle notifications.
   * @param observer - The observer to add.
   */
  addObserver(observer: AppLifecycleObserver): void {
    this.observers.add(observer);
  }

  /**
   * Remove a previously added observer.
   * @param observer - The observer to remove.
   */
  removeObserver(observer: AppLifecycleObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Transition to a new lifecycle state and notify all observers.
   * No-op if the state is unchanged.
   * @param state - The new lifecycle state.
   */
  transition(state: AppLifecycleState): void {
    if (this.state === state) {
      return;
    }
    this.state = state;
    for (const observer of this.observers) {
      observer.onLifecycleChange(state);
    }
  }

  /**
   * Factory method that creates an `AppLifecycleTracker` wired to React Native's
   * `AppState`. The tracker's initial state is derived from `AppState.currentState`
   * and subsequent changes are forwarded via `AppState.addEventListener('change', ...)`.
   *
   * Call `.remove()` on the returned subscription token to stop listening.
   *
   * @param appState - The React Native `AppState` object (import from `react-native`).
   * @returns An object containing the tracker and a remove() function to detach the listener.
   *
   * @example
   * ```typescript
   * import { AppState } from 'react-native';
   * const { tracker, remove } = AppLifecycleTracker.fromAppState(AppState);
   * tracker.addObserver({ onLifecycleChange: (s) => console.log('Lifecycle:', s) });
   * // Later: remove() to unsubscribe
   * ```
   */
  static fromAppState(appState: RNAppState): { tracker: AppLifecycleTracker; remove(): void } {
    const tracker = new AppLifecycleTracker();

    // Seed tracker with the current state
    const initialState = AppLifecycleTracker.mapRNState(appState.currentState);
    if (initialState !== AppLifecycleState.Active) {
      tracker.transition(initialState);
    }

    const subscription = appState.addEventListener('change', (nextState: string) => {
      tracker.transition(AppLifecycleTracker.mapRNState(nextState));
    });

    return {
      tracker,
      remove(): void {
        subscription.remove();
      },
    };
  }

  /** Map a React Native AppState string to AppLifecycleState. */
  private static mapRNState(rnState: string): AppLifecycleState {
    switch (rnState) {
      case 'active':     return AppLifecycleState.Active;
      case 'inactive':   return AppLifecycleState.Inactive;
      case 'background': return AppLifecycleState.Background;
      default:           return AppLifecycleState.Active;
    }
  }
}
