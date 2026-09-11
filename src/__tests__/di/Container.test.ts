import { Container, Lifetime } from '../../di/Container';

describe('DI Container', () => {
  it('should register and resolve a transient dependency', () => {
    const container = new Container();
    let count = 0;
    container.register<number>('counter', Lifetime.Transient, () => ++count);
    expect(container.resolve<number>('counter')).toBe(1);
    expect(container.resolve<number>('counter')).toBe(2);
  });

  it('should resolve a singleton only once', () => {
    const container = new Container();
    let count = 0;
    container.register<number>('single', Lifetime.Singleton, () => ++count);
    expect(container.resolve<number>('single')).toBe(1);
    expect(container.resolve<number>('single')).toBe(1);
  });

  it('should scope instances per child container', () => {
    const container = new Container();
    let count = 0;
    container.register<number>('scoped', Lifetime.Scoped, () => ++count);
    const child1 = container.createChildContainer();
    const child2 = container.createChildContainer();
    expect(child1.resolve<number>('scoped')).toBe(1);
    expect(child1.resolve<number>('scoped')).toBe(1);
    expect(child2.resolve<number>('scoped')).toBe(2);
  });

  it('should detect circular dependencies', () => {
    const container = new Container();
    container.register('a', Lifetime.Transient, (c) => c.resolve('b'));
    container.register('b', Lifetime.Transient, (c) => c.resolve('a'));
    expect(() => container.resolve('a')).toThrow('Circular dependency');
  });

  it('should throw for unregistered keys', () => {
    const container = new Container();
    expect(() => container.resolve('missing')).toThrow('No registration found');
  });

  // FIX 16 — scoped through parent tests
  it('two child containers should get independent scoped instances', () => {
    const parent = new Container();
    let count = 0;
    parent.register<number>('dep', Lifetime.Scoped, () => ++count);
    const child1 = parent.createChildContainer();
    const child2 = parent.createChildContainer();
    const v1 = child1.resolve<number>('dep');
    const v2 = child2.resolve<number>('dep');
    expect(v1).not.toBe(v2);
    expect(v1).toBe(1);
    expect(v2).toBe(2);
  });

  it('scoped resolved through parent should cache in child scope (not parent)', () => {
    const parent = new Container();
    let count = 0;
    parent.register<number>('dep', Lifetime.Scoped, () => ++count);
    const child = parent.createChildContainer();
    const first = child.resolve<number>('dep');
    const second = child.resolve<number>('dep');
    expect(first).toBe(second); // cached in child
    expect(first).toBe(1);
  });

  // FIX 17 — dispose tests
  it('dispose() should prevent further resolve', () => {
    const container = new Container();
    container.register('key', Lifetime.Singleton, () => 42);
    container.dispose();
    expect(() => container.resolve('key')).toThrow('Container has been disposed');
  });

  it('dispose() should prevent further register', () => {
    const container = new Container();
    container.dispose();
    expect(() => container.register('key', Lifetime.Singleton, () => 42)).toThrow('Container has been disposed');
  });

  it('resetRegistrations removes all registrations', () => {
    const container = new Container();
    container.register('key', Lifetime.Singleton, () => 42);
    container.resetRegistrations();
    expect(() => container.resolve('key')).toThrow('No registration found');
  });
});
