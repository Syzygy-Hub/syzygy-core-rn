import { InMemoryFeatureFlagProvider, FeatureFlag } from '../../featureflags/FeatureFlagProvider';

describe('InMemoryFeatureFlagProvider', () => {
  const darkMode: FeatureFlag<boolean> = { key: 'dark_mode', defaultValue: false };
  const maxRetries: FeatureFlag<number> = { key: 'max_retries', defaultValue: 3 };

  it('should return default value when nothing is set', () => {
    const provider = new InMemoryFeatureFlagProvider();
    expect(provider.value(darkMode)).toBe(false);
    expect(provider.value(maxRetries)).toBe(3);
  });

  it('should return base value over default', () => {
    const provider = new InMemoryFeatureFlagProvider();
    provider.setValue(darkMode, true);
    expect(provider.value(darkMode)).toBe(true);
  });

  it('should return override over base value', () => {
    const provider = new InMemoryFeatureFlagProvider();
    provider.setValue(maxRetries, 5);
    provider.setOverride(maxRetries, 10);
    expect(provider.value(maxRetries)).toBe(10);
  });

  it('should revert to base value when override is cleared', () => {
    const provider = new InMemoryFeatureFlagProvider();
    provider.setValue(darkMode, true);
    provider.setOverride(darkMode, false);
    expect(provider.value(darkMode)).toBe(false);
    provider.clearOverride(darkMode);
    expect(provider.value(darkMode)).toBe(true);
  });
});
