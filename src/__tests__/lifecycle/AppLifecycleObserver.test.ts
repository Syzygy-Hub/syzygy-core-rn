import { AppLifecycleTracker } from '../../lifecycle/AppLifecycleObserver';

describe('AppLifecycleTracker', () => {
  it('should instantiate', () => {
    const tracker = new AppLifecycleTracker();
    expect(tracker).toBeDefined();
  });
});
