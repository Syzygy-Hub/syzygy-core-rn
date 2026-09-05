import { FeatureFlagProvider } from '../../featureflags/FeatureFlagProvider';

describe('FeatureFlagProvider', () => {
  it('should instantiate', () => {
    const provider = new FeatureFlagProvider();
    expect(provider).toBeDefined();
  });
});
