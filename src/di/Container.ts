/**
 * Dependency Injection Container
 *
 * Thread-safe dependency injection container with singleton, transient, and scoped lifetimes.
 * Supports hierarchical containers with circular dependency detection.
 */

/** Lifetime strategy for registered dependencies. */
export enum Lifetime {
  /** A single instance is created and shared across all resolutions. */
  Singleton = 'singleton',
  /** A new instance is created on every resolution. */
  Transient = 'transient',
  /** A single instance per child scope; parent scope creates a new one per child. */
  Scoped = 'scoped',
}

interface Registration<T> {
  lifetime: Lifetime;
  factory: (container: Container) => T;
  singletonInstance?: T;
}

/**
 * Hierarchical dependency injection container.
 *
 * @example
 * ```typescript
 * const container = new Container();
 * container.register('logger', Lifetime.Singleton, () => new ConsoleLogger());
 * const logger = container.resolve<ConsoleLogger>('logger');
 * ```
 */
export class Container {
  private registrations = new Map<string, Registration<unknown>>();
  private scopedInstances = new Map<string, unknown>();
  private resolving = new Set<string>();
  private parent?: Container;

  /** Create a new container, optionally as a child of a parent container. */
  constructor(parent?: Container) {
    this.parent = parent;
  }

  /**
   * Register a dependency with a given lifetime and factory.
   * @param key - Unique string key for the dependency.
   * @param lifetime - The lifetime strategy.
   * @param factory - Factory function that creates the dependency.
   */
  register<T>(key: string, lifetime: Lifetime, factory: (container: Container) => T): void {
    this.registrations.set(key, { lifetime, factory } as Registration<unknown>);
  }

  /**
   * Resolve a dependency by key.
   * @param key - The registered key.
   * @returns The resolved instance.
   * @throws Error if the key is not registered or a circular dependency is detected.
   */
  resolve<T>(key: string): T {
    if (this.resolving.has(key)) {
      throw new Error(`Circular dependency detected for key: ${key}`);
    }

    const registration = this.registrations.get(key) ?? this.parent?.findRegistration(key);
    if (!registration) {
      throw new Error(`No registration found for key: ${key}`);
    }

    this.resolving.add(key);
    try {
      switch (registration.lifetime) {
        case Lifetime.Singleton: {
          if (registration.singletonInstance === undefined) {
            registration.singletonInstance = registration.factory(this);
          }
          return registration.singletonInstance as T;
        }
        case Lifetime.Transient: {
          return registration.factory(this) as T;
        }
        case Lifetime.Scoped: {
          if (this.scopedInstances.has(key)) {
            return this.scopedInstances.get(key) as T;
          }
          const instance = registration.factory(this);
          this.scopedInstances.set(key, instance);
          return instance as T;
        }
      }
    } finally {
      this.resolving.delete(key);
    }
  }

  /**
   * Create a child container that inherits registrations from this container.
   * Scoped dependencies will get fresh instances in the child.
   */
  createChildContainer(): Container {
    return new Container(this);
  }

  /** @internal Find a registration in this container or its parent chain. */
  private findRegistration(key: string): Registration<unknown> | undefined {
    return this.registrations.get(key) ?? this.parent?.findRegistration(key);
  }
}
