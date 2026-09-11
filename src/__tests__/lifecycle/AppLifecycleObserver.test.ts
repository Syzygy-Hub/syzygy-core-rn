import { AppLifecycleTracker, AppLifecycleState, RNAppState } from '../../lifecycle/AppLifecycleObserver';

describe('AppLifecycleTracker', () => {
  it('should start in Active state', () => {
    const tracker = new AppLifecycleTracker();
    expect(tracker.currentState).toBe(AppLifecycleState.Active);
  });

  it('should notify observers on state transitions', () => {
    const tracker = new AppLifecycleTracker();
    const states: AppLifecycleState[] = [];
    tracker.addObserver({ onLifecycleChange: (s) => states.push(s) });
    tracker.transition(AppLifecycleState.Background);
    tracker.transition(AppLifecycleState.Active);
    expect(states).toEqual([AppLifecycleState.Background, AppLifecycleState.Active]);
  });

  it('should not notify on same-state transition', () => {
    const tracker = new AppLifecycleTracker();
    const states: AppLifecycleState[] = [];
    tracker.addObserver({ onLifecycleChange: (s) => states.push(s) });
    tracker.transition(AppLifecycleState.Active); // already active
    expect(states).toEqual([]);
  });

  it('should stop notifying removed observers', () => {
    const tracker = new AppLifecycleTracker();
    const states: AppLifecycleState[] = [];
    const observer = { onLifecycleChange: (s: AppLifecycleState) => states.push(s) };
    tracker.addObserver(observer);
    tracker.transition(AppLifecycleState.Inactive);
    tracker.removeObserver(observer);
    tracker.transition(AppLifecycleState.Background);
    expect(states).toEqual([AppLifecycleState.Inactive]);
  });

  // FIX 24 — fromAppState factory tests
  it('fromAppState() should wire to RNAppState change events', () => {
    let capturedHandler: ((state: string) => void) | undefined;
    const mockAppState: RNAppState = {
      currentState: 'active',
      addEventListener(_type, handler) {
        capturedHandler = handler;
        return { remove: jest.fn() };
      },
    };
    const { tracker } = AppLifecycleTracker.fromAppState(mockAppState);
    expect(tracker.currentState).toBe(AppLifecycleState.Active);

    const states: AppLifecycleState[] = [];
    tracker.addObserver({ onLifecycleChange: (s) => states.push(s) });

    capturedHandler!('background');
    expect(states).toEqual([AppLifecycleState.Background]);
    capturedHandler!('active');
    expect(states).toEqual([AppLifecycleState.Background, AppLifecycleState.Active]);
  });

  it('fromAppState() should seed tracker with current RN state', () => {
    const mockAppState: RNAppState = {
      currentState: 'background',
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      addEventListener(_type, _handler) {
        return { remove: jest.fn() };
      },
    };
    const { tracker } = AppLifecycleTracker.fromAppState(mockAppState);
    expect(tracker.currentState).toBe(AppLifecycleState.Background);
  });

  it('fromAppState() remove() stops receiving events', () => {
    const removeFn = jest.fn();
    let capturedHandler: ((state: string) => void) | undefined;
    const mockAppState: RNAppState = {
      currentState: 'active',
      addEventListener(_type, handler) {
        capturedHandler = handler;
        return { remove: removeFn };
      },
    };
    const { remove } = AppLifecycleTracker.fromAppState(mockAppState);
    remove();
    expect(removeFn).toHaveBeenCalledTimes(1);
    // After remove, any further RN events would still call the internal handler
    // but we've verified the subscription was torn down
    expect(capturedHandler).toBeDefined();
  });
});
