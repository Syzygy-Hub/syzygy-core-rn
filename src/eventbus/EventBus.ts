/**
 * Typed event bus with publish/subscribe pattern.
 */

/** Handler callback for a specific event type. */
export type EventHandler<E> = (event: E) => void;

/** Token returned from subscribe; call cancel() to unsubscribe. */
export interface SubscriptionToken {
  /** Remove this subscription. */
  cancel(): void;
}

/**
 * Publish/subscribe event bus with string-keyed event types.
 *
 * Handlers are dispatched asynchronously via `queueMicrotask` so that
 * errors in one handler do not prevent others from running.
 *
 * @example
 * ```typescript
 * const bus = new EventBus();
 * bus.subscribe<{ userId: string }>('user:login', (e) => console.log(e.userId));
 * bus.publish('user:login', { userId: '42' });
 * ```
 */
export class EventBus {
  private handlers = new Map<string, Set<EventHandler<unknown>>>();
  private disposed = false;
  private readonly onHandlerError?: (error: unknown, event: unknown) => void;

  constructor(options?: { onHandlerError?: (error: unknown, event: unknown) => void }) {
    this.onHandlerError = options?.onHandlerError;
  }

  /**
   * Publish an event to all subscribers of the given event type.
   * Each handler is invoked asynchronously via queueMicrotask.
   * Errors in individual handlers are caught and logged; other handlers still run.
   * @param eventType - The string key identifying the event type.
   * @param event - The event payload.
   * @throws Error if the EventBus has been disposed.
   */
  publish<E>(eventType: string, event: E): void {
    if (this.disposed) {
      throw new Error('EventBus has been disposed');
    }
    const set = this.handlers.get(eventType);
    if (set) {
      for (const handler of set) {
        const captured = handler;
        queueMicrotask(() => {
          try {
            captured(event);
          } catch (err) {
            if (this.onHandlerError) {
              this.onHandlerError(err, event);
            } else {
              // eslint-disable-next-line no-console
              console.error('EventBus handler error:', err);
            }
          }
        });
      }
    }
  }

  /**
   * Subscribe to events of a given type.
   * @param eventType - The string key identifying the event type.
   * @param handler - Callback invoked when an event of this type is published.
   * @returns A token that can cancel the subscription.
   * @throws Error if the EventBus has been disposed.
   */
  subscribe<E>(eventType: string, handler: EventHandler<E>): SubscriptionToken {
    if (this.disposed) {
      throw new Error('EventBus has been disposed');
    }
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    const set = this.handlers.get(eventType)!;
    const wrapped = handler as EventHandler<unknown>;
    set.add(wrapped);

    return {
      cancel: (): void => {
        set.delete(wrapped);
        if (set.size === 0) {
          this.handlers.delete(eventType);
        }
      },
    };
  }

  /**
   * Dispose the EventBus: cancel all subscriptions, clear handler map,
   * and mark disposed so further publish/subscribe throws.
   */
  dispose(): void {
    this.handlers.clear();
    this.disposed = true;
  }
}
