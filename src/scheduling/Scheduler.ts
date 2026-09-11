/**
 * Task scheduling utilities: delayed execution, debouncing, and throttling.
 */

/** A scheduled task that can be cancelled. */
export interface CancellableTask {
  /** Cancel the scheduled task. */
  cancel(): void;
  /** Whether the task has been cancelled. */
  readonly isCancelled: boolean;
}

/** Protocol for scheduling delayed actions. */
export interface SchedulerProtocol {
  /**
   * Schedule an action to run after a delay.
   * @param delayMs - Delay in milliseconds.
   * @param action - The action to execute.
   * @returns A cancellable task handle.
   */
  schedule(delayMs: number, action: () => void): CancellableTask;
}

/**
 * Default scheduler implementation using setTimeout/clearTimeout.
 */
export class DefaultScheduler implements SchedulerProtocol {
  /** Schedule an action using setTimeout. */
  schedule(delayMs: number, action: () => void): CancellableTask {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) {
        action();
      }
    }, delayMs);

    return {
      cancel(): void {
        cancelled = true;
        clearTimeout(id);
      },
      get isCancelled(): boolean {
        return cancelled;
      },
    };
  }
}

/**
 * Debouncer that delays execution until a quiet period elapses.
 *
 * Each call to {@link call} resets the timer. The action only fires
 * after no calls have been made for the configured delay.
 *
 * @example
 * ```typescript
 * const debouncer = new Debouncer(300);
 * inputField.onInput(() => debouncer.call(() => search(inputField.value)));
 * ```
 */
export class Debouncer {
  private delayMs: number;
  private scheduler: SchedulerProtocol;
  private pending: CancellableTask | undefined;

  constructor(delayMs: number, scheduler?: SchedulerProtocol) {
    this.delayMs = delayMs;
    this.scheduler = scheduler ?? new DefaultScheduler();
  }

  /**
   * Schedule an action, cancelling any previously pending action.
   * @param action - The action to debounce.
   */
  call(action: () => void): void {
    this.pending?.cancel();
    this.pending = this.scheduler.schedule(this.delayMs, action);
  }

  /** Cancel any pending action. */
  cancel(): void {
    this.pending?.cancel();
    this.pending = undefined;
  }
}

/**
 * Throttler that limits execution to at most once per interval.
 *
 * The first call executes immediately. Subsequent calls within the
 * interval are dropped until the interval elapses.
 *
 * @example
 * ```typescript
 * const throttler = new Throttler(1000);
 * window.onScroll(() => throttler.call(() => updatePosition()));
 * ```
 */
export class Throttler {
  private intervalMs: number;
  private scheduler: SchedulerProtocol;
  private clock: () => number;
  private pending: CancellableTask | undefined;
  private lastExecution = 0;

  constructor(intervalMs: number, scheduler?: SchedulerProtocol, clock: () => number = Date.now) {
    this.intervalMs = intervalMs;
    this.scheduler = scheduler ?? new DefaultScheduler();
    this.clock = clock;
  }

  /**
   * Execute the action if the interval has elapsed, otherwise schedule it.
   * @param action - The action to throttle.
   */
  call(action: () => void): void {
    const now = this.clock();
    const elapsed = now - this.lastExecution;

    if (elapsed >= this.intervalMs) {
      this.lastExecution = now;
      action();
    } else if (!this.pending || this.pending.isCancelled) {
      const remaining = this.intervalMs - elapsed;
      this.pending = this.scheduler.schedule(remaining, () => {
        this.lastExecution = this.clock();
        this.pending = undefined;
        action();
      });
    }
  }

  /** Cancel any pending throttled action. */
  cancel(): void {
    this.pending?.cancel();
    this.pending = undefined;
  }
}
