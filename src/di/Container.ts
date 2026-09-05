// DI Container
// Thread-safe dependency injection container with singleton, transient, and scoped lifetimes.

export enum Lifetime {
  Singleton = 'singleton',
  Transient = 'transient',
  Scoped = 'scoped',
}

export class Container {
  // TODO: registration storage, resolution, child scopes
}
