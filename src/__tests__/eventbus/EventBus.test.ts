import { EventBus } from '../../eventbus/EventBus';

describe('EventBus', () => {
  it('should instantiate', () => {
    const bus = new EventBus();
    expect(bus).toBeDefined();
  });
});
