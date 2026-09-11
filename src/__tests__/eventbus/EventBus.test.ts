import { EventBus } from '../../eventbus/EventBus';

/** Flush all queued microtasks. */
const flushMicrotasks = (): Promise<void> => Promise.resolve();

describe('EventBus', () => {
  it('should deliver events to subscribers', async () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe<string>('msg', (e) => received.push(e));
    bus.publish('msg', 'hello');
    bus.publish('msg', 'world');
    await flushMicrotasks();
    expect(received).toEqual(['hello', 'world']);
  });

  it('should not deliver events after cancellation', async () => {
    const bus = new EventBus();
    const received: number[] = [];
    const token = bus.subscribe<number>('num', (e) => received.push(e));
    bus.publish('num', 1);
    await flushMicrotasks();
    token.cancel();
    bus.publish('num', 2);
    await flushMicrotasks();
    expect(received).toEqual([1]);
  });

  it('should isolate event types', async () => {
    const bus = new EventBus();
    const aEvents: string[] = [];
    const bEvents: string[] = [];
    bus.subscribe<string>('a', (e) => aEvents.push(e));
    bus.subscribe<string>('b', (e) => bEvents.push(e));
    bus.publish('a', 'alpha');
    bus.publish('b', 'beta');
    await flushMicrotasks();
    expect(aEvents).toEqual(['alpha']);
    expect(bEvents).toEqual(['beta']);
  });

  it('should handle publish with no subscribers gracefully', async () => {
    const bus = new EventBus();
    expect(() => bus.publish('none', 'data')).not.toThrow();
    await flushMicrotasks();
  });

  it('should continue delivering to other handlers when one throws (FIX 11)', async () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe<string>('evt', () => { throw new Error('handler error'); });
    bus.subscribe<string>('evt', (e) => received.push(e));
    bus.publish('evt', 'payload');
    await flushMicrotasks();
    expect(received).toEqual(['payload']);
  });

  // FIX 17 — dispose tests
  it('dispose() should clear subscriptions and throw on further publish', async () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe<string>('msg', (e) => received.push(e));
    bus.dispose();
    expect(() => bus.publish('msg', 'after-dispose')).toThrow('EventBus has been disposed');
    await flushMicrotasks();
    expect(received).toHaveLength(0);
  });

  it('dispose() should throw on further subscribe', () => {
    const bus = new EventBus();
    bus.dispose();
    expect(() => bus.subscribe('msg', () => {})).toThrow('EventBus has been disposed');
  });

  it('calls onHandlerError when handler throws', async () => {
    const errors: Array<{ error: unknown; event: unknown }> = [];
    const bus = new EventBus({
      onHandlerError: (error, event) => errors.push({ error, event }),
    });
    const handlerError = new Error('boom');
    bus.subscribe<string>('evt', () => { throw handlerError; });
    bus.publish('evt', 'payload');
    await flushMicrotasks();
    expect(errors).toHaveLength(1);
    expect(errors[0].error).toBe(handlerError);
    expect(errors[0].event).toBe('payload');
  });
});
