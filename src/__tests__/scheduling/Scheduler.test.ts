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
});
