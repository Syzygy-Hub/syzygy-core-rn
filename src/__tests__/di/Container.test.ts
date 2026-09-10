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
});
