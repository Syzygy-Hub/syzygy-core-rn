import { EventBus } from '../../eventbus/EventBus';

describe('EventBus', () => {
  it('should deliver events to subscribers', () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe<string>('msg', (e) => received.push(e));
    bus.publish('msg', 'hello');
    bus.publish('msg', 'world');
    expect(received).toEqual(['hello', 'world']);
  });

  it('should not deliver events after cancellation', () => {
    const bus = new EventBus();
    const received: number[] = [];
    const token = bus.subscribe<number>('num', (e) => received.push(e));
    bus.publish('num', 1);
    token.cancel();
    bus.publish('num', 2);
    expect(received).toEqual([1]);
  });

  it('should isolate event types', () => {
    const bus = new EventBus();
    const aEvents: string[] = [];
    const bEvents: string[] = [];
    bus.subscribe<string>('a', (e) => aEvents.push(e));
    bus.subscribe<string>('b', (e) => bEvents.push(e));
    bus.publish('a', 'alpha');
    bus.publish('b', 'beta');
    expect(aEvents).toEqual(['alpha']);
    expect(bEvents).toEqual(['beta']);
  });

  it('should handle publish with no subscribers gracefully', () => {
    const bus = new EventBus();
    expect(() => bus.publish('none', 'data')).not.toThrow();
  });
});
