/**
 * Feature flag system with typed flags and override support.
 */

/** A typed feature flag definition. */
export interface FeatureFlag<T> {
  /** Unique key for this flag. */
  readonly key: string;
  /** Value returned when no explicit value is set. */
  readonly defaultValue: T;
  /** Human-readable description of what this flag controls. */
  readonly description?: string;
}

/** Provider that resolves feature flag values. */
export interface FeatureFlagProvider {
  /** Get the current value of a feature flag. */
  value<T>(flag: FeatureFlag<T>): T;
}

/**
 * In-memory feature flag provider with base values and override support.
 *
 * Overrides take precedence over base values, which take precedence over defaults.
 *
 * @example
 * ```typescript
 * const flag: FeatureFlag<boolean> = { key: 'dark_mode', defaultValue: false };
 * const provider = new InMemoryFeatureFlagProvider();
 * provider.setValue(flag, true);
 * provider.value(flag); // true
 * ```
 */
export class InMemoryFeatureFlagProvider implements FeatureFlagProvider {
  private values = new Map<string, unknown>();
  private overrides = new Map<string, unknown>();

  /**
   * Get the current value of a feature flag.
   * Resolution order: override > base value > default.
   */
  value<T>(flag: FeatureFlag<T>): T {
    if (this.overrides.has(flag.key)) {
      return this.overrides.get(flag.key) as T;
    }
    if (this.values.has(flag.key)) {
      return this.values.get(flag.key) as T;
    }
    return flag.defaultValue;
  }

  /**
   * Set the base value for a flag.
   * @param flag - The flag definition.
   * @param value - The value to set.
   */
  setValue<T>(flag: FeatureFlag<T>, value: T): void {
    this.values.set(flag.key, value);
  }

  /**
   * Set an override that takes precedence over the base value.
   * @param flag - The flag definition.
   * @param value - The override value.
   */
  setOverride<T>(flag: FeatureFlag<T>, value: T): void {
    this.overrides.set(flag.key, value);
  }

  /**
   * Clear an override, reverting to the base value or default.
   * @param flag - The flag definition.
   */
  clearOverride<T>(flag: FeatureFlag<T>): void {
    this.overrides.delete(flag.key);
  }
}
