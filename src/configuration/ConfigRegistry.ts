// Configuration
// In-memory config registry, environment-based switching, and typed config access.

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

export class ConfigRegistry {
  constructor(private readonly environment: Environment = Environment.Production) {}

  // TODO: key-value storage, environment-based overlays, typed getters
}
