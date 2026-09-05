import { LogLevel, ConsoleLogDestination } from '../../logging/Logger';

describe('Logger', () => {
  it('should have ordered log levels', () => {
    expect(LogLevel.Debug).toBeLessThan(LogLevel.Error);
  });

  it('should write to console', () => {
    const dest = new ConsoleLogDestination();
    dest.write('test', LogLevel.Info);
  });
});
