import { Logger, LogLevel, LogDestination, ConsoleLogDestination } from '../../logging/Logger';
import {
  LogLevel as FoundationLogLevel,
  LogEntry,
  SyzygyTimestamp,
  createSyzygyTimestamp,
} from 'syzygy-foundation-rn';

interface SpyEntry {
  message: string;
  level: LogLevel;
  metadata: Record<string, string>;
  timestamp?: SyzygyTimestamp;
  error?: Error;
}

class SpyDestination implements LogDestination {
  entries: SpyEntry[] = [];
  write(
    message: string,
    level: LogLevel,
    metadata: Record<string, string>,
    timestamp?: SyzygyTimestamp,
    error?: Error,
  ): void {
    this.entries.push({ message, level, metadata, timestamp, error });
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

  // FIX 8 — Foundation log(LogEntry) path tests

  it('should map Foundation Debug level to Core Debug', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const entry: LogEntry = {
      level: FoundationLogLevel.Debug,
      message: 'debug msg',
      timestamp: createSyzygyTimestamp(1000),
      metadata: {},
    };
    logger.log(entry);
    expect(spy.entries[0].level).toBe(LogLevel.Debug);
  });

  it('should map all 5 Foundation LogLevels to correct Core LogLevels', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const levels: Array<[FoundationLogLevel, LogLevel]> = [
      [FoundationLogLevel.Debug,    LogLevel.Debug],
      [FoundationLogLevel.Info,     LogLevel.Info],
      [FoundationLogLevel.Warning,  LogLevel.Warning],
      [FoundationLogLevel.Error,    LogLevel.Error],
      [FoundationLogLevel.Critical, LogLevel.Critical],
    ];
    for (const [foundationLevel, coreLevel] of levels) {
      spy.entries = [];
      const entry: LogEntry = {
        level: foundationLevel,
        message: 'msg',
        timestamp: createSyzygyTimestamp(0),
        metadata: {},
      };
      logger.log(entry);
      expect(spy.entries[0].level).toBe(coreLevel);
    }
  });

  it('should forward metadata via log(LogEntry)', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const entry: LogEntry = {
      level: FoundationLogLevel.Info,
      message: 'with meta',
      timestamp: createSyzygyTimestamp(0),
      metadata: { key: 'value', other: 'data' },
    };
    logger.log(entry);
    expect(spy.entries[0].metadata).toEqual({ key: 'value', other: 'data' });
  });

  it('should forward timestamp via log(LogEntry)', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const ts = createSyzygyTimestamp(1234567890);
    const entry: LogEntry = {
      level: FoundationLogLevel.Info,
      message: 'timed',
      timestamp: ts,
      metadata: {},
    };
    logger.log(entry);
    expect(spy.entries[0].timestamp).toBe(ts);
  });

  it('should forward error via log(LogEntry)', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const err = new Error('boom');
    const entry: LogEntry = {
      level: FoundationLogLevel.Error,
      message: 'failed',
      timestamp: createSyzygyTimestamp(0),
      metadata: {},
      error: err,
    };
    logger.log(entry);
    expect(spy.entries[0].error).toBe(err);
  });

  it('should forward Error param via error() convenience method', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const err = new Error('error method');
    logger.error('something failed', err, {});
    expect(spy.entries[0].level).toBe(LogLevel.Error);
    expect(spy.entries[0].error).toBe(err);
  });

  it('should forward Error param via critical() convenience method', () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const err = new Error('critical error');
    logger.critical('critical failure', err, {});
    expect(spy.entries[0].level).toBe(LogLevel.Critical);
    expect(spy.entries[0].error).toBe(err);
  });

  it('concurrent log calls from multiple async operations complete without error', async () => {
    const logger = new Logger();
    const spy = new SpyDestination();
    logger.addDestination(spy);
    const ops = Array.from({ length: 10 }, (_, i) =>
      Promise.resolve().then(() => logger.info(`message ${i}`)),
    );
    await expect(Promise.all(ops)).resolves.toBeDefined();
    expect(spy.entries).toHaveLength(10);
  });
});
