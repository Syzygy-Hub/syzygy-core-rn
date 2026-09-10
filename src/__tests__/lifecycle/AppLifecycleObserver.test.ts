import { AppLifecycleTracker, AppLifecycleState } from '../../lifecycle/AppLifecycleObserver';

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
});
