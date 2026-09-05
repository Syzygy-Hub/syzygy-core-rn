import { StateStore } from '../../state/StateStore';

describe('StateStore', () => {
  it('should hold initial state', () => {
    const store = new StateStore(0);
    expect(store.state).toBe(0);
  });
});
