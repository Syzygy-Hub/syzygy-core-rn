import { Scheduler } from '../../scheduling/Scheduler';

describe('Scheduler', () => {
  it('should instantiate', () => {
    const scheduler = new Scheduler();
    expect(scheduler).toBeDefined();
  });
});
