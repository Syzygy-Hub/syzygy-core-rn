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

  // FIX 22 — type-guard safe cast tests
  it('should throw a descriptive error when base value type mismatches flag default type', () => {
    const provider = new InMemoryFeatureFlagProvider();
    // Simulate storing a value with a wrong type by using the internal map via any
    (provider as unknown as { values: Map<string, unknown> }).values.set('dark_mode', 42);
    expect(() => provider.value(darkMode)).toThrow(
      'Type mismatch for feature flag "dark_mode": expected boolean, got number',
    );
  });

  it('should throw a descriptive error when override type mismatches flag default type', () => {
    const provider = new InMemoryFeatureFlagProvider();
    (provider as unknown as { overrides: Map<string, unknown> }).overrides.set('dark_mode', 'yes');
    expect(() => provider.value(darkMode)).toThrow(
      'Type mismatch for feature flag "dark_mode": expected boolean, got string',
    );
  });
});
