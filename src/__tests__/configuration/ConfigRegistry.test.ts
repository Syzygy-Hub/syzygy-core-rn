import { ConfigRegistry, Environment } from '../../configuration/ConfigRegistry';

describe('ConfigRegistry', () => {
  it('should instantiate with environment', () => {
    const registry = new ConfigRegistry(Environment.Development);
    expect(registry).toBeDefined();
  });
});
