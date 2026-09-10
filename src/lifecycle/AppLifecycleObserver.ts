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
 * Tracks the application lifecycle state and notifies observers of transitions.
 *
 * @example
 * ```typescript
 * const tracker = new AppLifecycleTracker();
 * tracker.addObserver({ onLifecycleChange: (s) => console.log(s) });
 * tracker.transition(AppLifecycleState.Background);
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
}
