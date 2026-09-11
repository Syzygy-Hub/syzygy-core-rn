/**
 * Environment-aware configuration registry.
 * Uses Foundation's SyzygyEnvironment type.
 */

import { SyzygyEnvironment } from 'syzygy-foundation-rn';

export { SyzygyEnvironment };

/** A typed configuration key with a default value. */
export interface ConfigKey<T> {
  /** Unique name for this config entry. */
  readonly name: string;
  /** Value returned when no explicit value has been set. */
  readonly defaultValue: T;
}

/**
 * Configuration registry that supports per-environment values.
 *
 * Values set with {@link set} apply to all environments.
 * Values set with {@link setForEnvironment} apply only to that environment
 * and take precedence over global values.
 *
 * @example
 * ```typescript
 * const apiUrl: ConfigKey<string> = { name: 'apiUrl', defaultValue: 'http://localhost' };
 * const config = new ConfigRegistry(SyzygyEnvironment.debug);
 * config.setForEnvironment(apiUrl, 'https://api.prod.com', SyzygyEnvironment.production);
 * config.switchEnvironment(SyzygyEnvironment.production);
 * config.get(apiUrl); // 'https://api.prod.com'
 * ```
 */
export class ConfigRegistry {
  private currentEnvironment: SyzygyEnvironment;
  private globalValues = new Map<string, unknown>();
  private envValues = new Map<string, Map<string, unknown>>();

  constructor(initialEnvironment: SyzygyEnvironment = SyzygyEnvironment.debug) {
    this.currentEnvironment = initialEnvironment;
  }

  /** The current environment. */
  get environment(): SyzygyEnvironment {
    return this.currentEnvironment;
  }

  /**
   * Get the value for a config key.
   * Resolution: environment-specific > global > default.
   * @throws Error if a stored value's type does not match the key's default value type.
   */
  get<T>(key: ConfigKey<T>): T {
    const envMap = this.envValues.get(this.currentEnvironment);
    if (envMap?.has(key.name)) {
      const stored = envMap.get(key.name);
      if (typeof stored !== typeof key.defaultValue) {
        throw new Error(
          `Type mismatch for config key "${key.name}": expected ${typeof key.defaultValue}, got ${typeof stored}`,
        );
      }
      return stored as T;
    }
    if (this.globalValues.has(key.name)) {
      const stored = this.globalValues.get(key.name);
      if (typeof stored !== typeof key.defaultValue) {
        throw new Error(
          `Type mismatch for config key "${key.name}": expected ${typeof key.defaultValue}, got ${typeof stored}`,
        );
      }
      return stored as T;
    }
    return key.defaultValue;
  }

  /**
   * Set a value that applies to all environments.
   * @param key - The config key.
   * @param value - The value to set.
   */
  set<T>(key: ConfigKey<T>, value: T): void {
    this.globalValues.set(key.name, value);
  }

  /**
   * Set a value for a specific environment.
   * @param key - The config key.
   * @param value - The value to set.
   * @param environment - The target environment.
   */
  setForEnvironment<T>(key: ConfigKey<T>, value: T, environment: SyzygyEnvironment): void {
    if (!this.envValues.has(environment)) {
      this.envValues.set(environment, new Map());
    }
    this.envValues.get(environment)!.set(key.name, value);
  }

  /**
   * Switch the active environment.
   * @param environment - The environment to switch to.
   */
  switchEnvironment(environment: SyzygyEnvironment): void {
    this.currentEnvironment = environment;
  }
}
