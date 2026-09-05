import { Container } from '../../di/Container';

describe('DI Container', () => {
  it('should instantiate', () => {
    const container = new Container();
    expect(container).toBeDefined();
  });
});
