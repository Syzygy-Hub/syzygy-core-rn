import { ConfigRegistry, SyzygyEnvironment, ConfigKey } from '../../configuration/ConfigRegistry';

describe('ConfigRegistry', () => {
  const apiUrl: ConfigKey<string> = { name: 'apiUrl', defaultValue: 'http://localhost' };
  const timeout: ConfigKey<number> = { name: 'timeout', defaultValue: 30 };

  it('should return default values when nothing is set', () => {
    const config = new ConfigRegistry();
    expect(config.get(apiUrl)).toBe('http://localhost');
    expect(config.get(timeout)).toBe(30);
  });

  it('should return globally set values', () => {
    const config = new ConfigRegistry();
    config.set(apiUrl, 'https://api.example.com');
    expect(config.get(apiUrl)).toBe('https://api.example.com');
  });

  it('should prefer environment-specific values over global', () => {
    const config = new ConfigRegistry(SyzygyEnvironment.production);
    config.set(apiUrl, 'https://global.example.com');
    config.setForEnvironment(apiUrl, 'https://prod.example.com', SyzygyEnvironment.production);
    expect(config.get(apiUrl)).toBe('https://prod.example.com');
  });

  it('should switch environments and resolve accordingly', () => {
    const config = new ConfigRegistry(SyzygyEnvironment.debug);
    config.setForEnvironment(timeout, 5, SyzygyEnvironment.debug);
    config.setForEnvironment(timeout, 60, SyzygyEnvironment.production);
    expect(config.get(timeout)).toBe(5);
    config.switchEnvironment(SyzygyEnvironment.production);
    expect(config.get(timeout)).toBe(60);
    expect(config.environment).toBe(SyzygyEnvironment.production);
  });
});
