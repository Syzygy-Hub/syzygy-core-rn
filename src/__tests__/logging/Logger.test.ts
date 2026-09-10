import { Logger, LogLevel, LogDestination, ConsoleLogDestination } from '../../logging/Logger';

class SpyDestination implements LogDestination {
  entries: { message: string; level: LogLevel; metadata: Record<string, string> }[] = [];
  write(message: string, level: LogLevel, metadata: Record<string, string>): void {
    this.entries.push({ message, level, metadata });
  }
}

describe('Logger', () => {
  it('should route messages to destinations', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    logger.info('test', { key: 'val' });
    expect(spy.entries).toHaveLength(1);
    expect(spy.entries[0].message).toBe('test');
    expect(spy.entries[0].level).toBe(LogLevel.Info);
    expect(spy.entries[0].metadata).toEqual({ key: 'val' });
  });

  it('should respect minimum level filter', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy, LogLevel.Warning);
    logger.debug('ignored');
    logger.warning('kept');
    logger.error('also kept');
    expect(spy.entries).toHaveLength(2);
  });

  it('should provide convenience methods for all levels', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    logger.verbose('v');
    logger.debug('d');
    logger.info('i');
    logger.warning('w');
    logger.error('e');
    logger.critical('c');
    expect(spy.entries.map((e) => e.level)).toEqual([
      LogLevel.Verbose, LogLevel.Debug, LogLevel.Info,
      LogLevel.Warning, LogLevel.Error, LogLevel.Critical,
    ]);
  });

  it('should write to console without throwing', () => {
    const dest = new ConsoleLogDestination();
    expect(() => dest.write('test', LogLevel.Info, {})).not.toThrow();
    expect(() => dest.write('err', LogLevel.Error, { ctx: 'x' })).not.toThrow();
  });
});
