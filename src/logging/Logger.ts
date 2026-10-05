/**
 * Structured logging with configurable destinations and severity levels.
 * Implements Foundation's LoggerProtocol while preserving Core's extended API.
 */

import {
  LoggerProtocol,
  LogLevel,
  LogEntry,
  SyzygyTimestamp,
} from 'syzygy-foundation-rn';

export { LogLevel } from 'syzygy-foundation-rn';

/** A destination that receives formatted log messages. */
export interface LogDestination {
  /** Write a log entry to this destination. */
  write(
    message: string,
    level: LogLevel,
    metadata: Record<string, string>,
    timestamp?: SyzygyTimestamp,
    error?: Error,
  ): void;
}

/** Log destination that writes to the console. */
export class ConsoleLogDestination implements LogDestination {
  private static readonly levelNames: Record<LogLevel, string> = {
    [LogLevel.Debug]: 'DEBUG',
    [LogLevel.Info]: 'INFO',
    [LogLevel.Warning]: 'WARNING',
    [LogLevel.Error]: 'ERROR',
    [LogLevel.Critical]: 'CRITICAL',
  };

  /** Write a log entry to the console. */
  write(
    message: string,
    level: LogLevel,
    metadata: Record<string, string>,
    timestamp?: SyzygyTimestamp,
    error?: Error,
  ): void {
    const meta = Object.keys(metadata).length > 0
      ? ` ${JSON.stringify(metadata)}`
      : '';
    const ts = timestamp !== undefined ? `[${new Date(timestamp.millisecondsSinceEpoch).toISOString()}] ` : '';
    const line = `${ts}[${ConsoleLogDestination.levelNames[level] ?? String(level)}] ${message}${meta}`;
    if (level >= LogLevel.Error) {
      // eslint-disable-next-line no-console
      console.error(line);
      if (error !== undefined) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    } else if (level === LogLevel.Warning) {
      // eslint-disable-next-line no-console
      console.warn(line);
    } else {
      // eslint-disable-next-line no-console
      console.log(line);
    }
  }
}

interface DestinationEntry {
  destination: LogDestination;
  minLevel: LogLevel;
}

/**
 * Multi-destination logger with level filtering.
 * Implements Foundation's LoggerProtocol; verbose is a Core-only extension
 * that maps to debug at the protocol boundary (Foundation has no verbose level).
 *
 * @example
 * ```typescript
 * const logger = new Logger();
 * logger.addDestination(new ConsoleLogDestination(), LogLevel.Debug);
 * logger.info('Server started', { port: '3000' });
 * ```
 */
export class Logger implements LoggerProtocol {
  private destinations: DestinationEntry[] = [];

  /**
   * Add a log destination with an optional minimum level filter.
   * @param destination - The destination to add.
   * @param minLevel - Minimum log level for this destination (default: Debug).
   */
  addDestination(destination: LogDestination, minLevel: LogLevel = LogLevel.Debug): void {
    this.destinations.push({ destination, minLevel });
  }

  /** Dispatch a message to all destinations that meet the minimum level threshold. */
  private dispatch(
    level: LogLevel,
    message: string,
    metadata: Record<string, string> = {},
    timestamp?: SyzygyTimestamp,
    error?: Error,
  ): void {
    for (const entry of this.destinations) {
      if (level >= entry.minLevel) {
        entry.destination.write(message, level, metadata, timestamp, error);
      }
    }
  }

  /**
   * Log a Foundation LogEntry (LoggerProtocol implementation).
   */
  log(entry: LogEntry): void;
  /**
   * Log a message at the specified level (Core extended API).
   * @param level - The severity level.
   * @param message - The log message.
   * @param metadata - Optional key-value metadata.
   */
  log(level: LogLevel, message: string, metadata?: Record<string, string>): void;
  log(
    entryOrLevel: LogEntry | LogLevel,
    message?: string,
    metadata: Record<string, string> = {},
  ): void {
    if (typeof entryOrLevel === 'object') {
      this.dispatch(entryOrLevel.level, entryOrLevel.message, entryOrLevel.metadata, entryOrLevel.timestamp, entryOrLevel.error);
    } else {
      this.dispatch(entryOrLevel, message!, metadata);
    }
  }

  /** Log at Verbose level (Core-only extension; maps to Debug since Foundation has no verbose). */
  verbose(message: string, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Debug, message, metadata);
  }

  /** Log at Debug level. */
  debug(message: string, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Debug, message, metadata);
  }

  /** Log at Info level. */
  info(message: string, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Info, message, metadata);
  }

  /** Log at Warning level. */
  warning(message: string, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Warning, message, metadata);
  }

  /** Log at Error level. */
  error(message: string, error?: Error, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Error, message, metadata ?? {}, undefined, error);
  }

  /** Log at Critical level. */
  critical(message: string, error?: Error, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Critical, message, metadata ?? {}, undefined, error);
  }
}
