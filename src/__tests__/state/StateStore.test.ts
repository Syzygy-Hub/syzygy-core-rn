import { StateStore } from '../../state/StateStore';

interface CounterState { count: number; label: string }
type CounterAction = { type: 'inc' } | { type: 'dec' } | { type: 'setLabel'; label: string };

const reducer = (state: CounterState, action: CounterAction): CounterState => {
  switch (action.type) {
    case 'inc': return { ...state, count: state.count + 1 };
    case 'dec': return { ...state, count: state.count - 1 };
    case 'setLabel': return { ...state, label: action.label };
  }
};

describe('StateStore', () => {
  it('should hold initial state and dispatch actions', () => {
    const store = new StateStore({ count: 0, label: '' }, reducer);
    store.dispatch({ type: 'inc' });
    store.dispatch({ type: 'inc' });
    expect(store.state.count).toBe(2);
  });

  it('should notify subscribers on dispatch', () => {
    const store = new StateStore({ count: 0, label: '' }, reducer);
    const states: number[] = [];
    store.subscribe((s) => states.push(s.count));
    store.dispatch({ type: 'inc' });
    store.dispatch({ type: 'dec' });
    expect(states).toEqual([1, 0]);
  });

  it('should unsubscribe correctly', () => {
    const store = new StateStore({ count: 0, label: '' }, reducer);
    const states: number[] = [];
    const unsub = store.subscribe((s) => states.push(s.count));
    store.dispatch({ type: 'inc' });
    unsub();
    store.dispatch({ type: 'inc' });
    expect(states).toEqual([1]);
  });

  it('should select and only fire on selected value change', () => {
    const store = new StateStore({ count: 0, label: 'hello' }, reducer);
    const counts: number[] = [];
    store.select((s) => s.count).subscribe((c) => counts.push(c));
    store.dispatch({ type: 'setLabel', label: 'world' }); // count unchanged
    store.dispatch({ type: 'inc' }); // count changes
    expect(counts).toEqual([1]);
  });
});
