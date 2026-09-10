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
 * @example
 * ```typescript
 * const bus = new EventBus();
 * bus.subscribe<{ userId: string }>('user:login', (e) => console.log(e.userId));
 * bus.publish('user:login', { userId: '42' });
 * ```
 */
export class EventBus {
  private handlers = new Map<string, Set<EventHandler<unknown>>>();

  /**
   * Publish an event to all subscribers of the given event type.
   * @param eventType - The string key identifying the event type.
   * @param event - The event payload.
   */
  publish<E>(eventType: string, event: E): void {
    const set = this.handlers.get(eventType);
    if (set) {
      for (const handler of set) {
        handler(event);
      }
    }
  }

  /**
   * Subscribe to events of a given type.
   * @param eventType - The string key identifying the event type.
   * @param handler - Callback invoked when an event of this type is published.
   * @returns A token that can cancel the subscription.
   */
  subscribe<E>(eventType: string, handler: EventHandler<E>): SubscriptionToken {
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
}
