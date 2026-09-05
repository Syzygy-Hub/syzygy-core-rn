// State Management
// Reactive state stores, observable properties, state reducers, and selectors.

export class StateStore<State> {
  private _state: State;

  constructor(initial: State) {
    this._state = initial;
  }

  get state(): State {
    return this._state;
  }

  // TODO: reduce, select, observe
}

export interface StateReducer<State, Action> {
  reduce(state: State, action: Action): State;
}
