import { DefaultScheduler, Debouncer, Throttler } from '../../scheduling/Scheduler';

describe('DefaultScheduler', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should execute after delay', () => {
    const scheduler = new DefaultScheduler();
    const fn = jest.fn();
    scheduler.schedule(100, fn);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel scheduled tasks', () => {
    const scheduler = new DefaultScheduler();
    const fn = jest.fn();
    const task = scheduler.schedule(100, fn);
    task.cancel();
    expect(task.isCancelled).toBe(true);
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('Debouncer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should debounce rapid calls', () => {
    const debouncer = new Debouncer(100);
    const fn = jest.fn();
    debouncer.call(fn);
    debouncer.call(fn);
    debouncer.call(fn);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending debounced action', () => {
    const debouncer = new Debouncer(100);
    const fn = jest.fn();
    debouncer.call(fn);
    debouncer.cancel();
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('Throttler', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('should execute first call immediately and throttle subsequent', () => {
    const throttler = new Throttler(100);
    const fn = jest.fn();
    throttler.call(fn); // immediate
    throttler.call(fn); // scheduled
    throttler.call(fn); // ignored (pending exists)
    expect(fn).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should use injected clock for deterministic interval verification', () => {
    // FIX 9 — injected fake clock
    // Start at 1000 so that elapsed (1000 - 0) >= intervalMs (100), allowing the first call to fire immediately
    let fakeNow = 1000;
    const fakeClock = (): number => fakeNow;
    const scheduler = new DefaultScheduler();
    const throttler = new Throttler(100, scheduler, fakeClock);
    const fn = jest.fn();

    // First call at t=1000: elapsed >> interval, executes immediately
    throttler.call(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    // Second call at t=1050: within interval, should be scheduled for remaining 50ms
    fakeNow = 1050;
    throttler.call(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance timers by 50ms: scheduled action fires
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should allow execution again after cooldown period', () => {
    // FIX 9 — post-cooldown execution test
    let fakeNow = 1000;
    const fakeClock = (): number => fakeNow;
    const scheduler = new DefaultScheduler();
    const throttler = new Throttler(100, scheduler, fakeClock);
    const fn = jest.fn();

    // First call at t=1000: interval has elapsed (1000 - 0 >= 100), executes immediately
    throttler.call(fn);
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance fake clock past the interval from last execution
    fakeNow = 1100;

    // Second call at t=1100: interval has elapsed (1100 - 1000 = 100 >= 100), executes immediately
    throttler.call(fn);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
