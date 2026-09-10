/**
 * Synchronous state management with reducer pattern.
 *
 * Provides a predictable state container inspired by Redux,
 * with selector-based subscriptions for granular updates.
 */

/** Pure function that produces the next state given the current state and an action. */
export type StateReducer<S, A> = (state: S, action: A) => S;

/** Function that derives a value from the state. */
export type StateSelector<S, T> = (state: S) => T;

/** Callback invoked when the state changes. */
export type StateListener<S> = (state: S) => void;

/** Function that removes a subscription when called. */
export type Unsubscribe = () => void;

/**
 * Synchronous state store with reducer-driven updates.
 *
 * @typeParam S - The state shape.
 * @typeParam A - The action type.
 *
 * @example
 * ```typescript
 * const store = new StateStore({ count: 0 }, (state, action: 'inc' | 'dec') =>
 *   action === 'inc' ? { count: state.count + 1 } : { count: state.count - 1 }
 * );
 * store.dispatch('inc');
 * ```
 */
export class StateStore<S, A> {
  private currentState: S;
  private reducer: StateReducer<S, A>;
  private listeners = new Set<StateListener<S>>();

  constructor(initialState: S, reducer: StateReducer<S, A>) {
    this.currentState = initialState;
    this.reducer = reducer;
  }

  /** The current state snapshot. */
  get state(): S {
    return this.currentState;
  }

  /**
   * Dispatch an action through the reducer and notify subscribers.
   * @param action - The action to dispatch.
   */
  dispatch(action: A): void {
    this.currentState = this.reducer(this.currentState, action);
    for (const listener of this.listeners) {
      listener(this.currentState);
    }
  }

  /**
   * Subscribe to all state changes.
   * @param listener - Callback invoked with the new state after each dispatch.
   * @returns An unsubscribe function.
   */
  subscribe(listener: StateListener<S>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Create a selector-based subscription that only fires when the selected value changes.
   * @param selector - Function that extracts a derived value from state.
   * @returns An object with a subscribe method for the selected value.
   */
  select<T>(selector: StateSelector<S, T>): { subscribe(listener: (value: T) => void): Unsubscribe } {
    return {
      subscribe: (listener: (value: T) => void): Unsubscribe => {
        let previousValue = selector(this.currentState);
        return this.subscribe((state) => {
          const nextValue = selector(state);
          if (nextValue !== previousValue) {
            previousValue = nextValue;
            listener(nextValue);
          }
        });
      },
    };
  }
}
