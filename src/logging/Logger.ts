/**
 * Structured logging with configurable destinations and severity levels.
 * Implements Foundation's LoggerProtocol while preserving Core's extended API.
 */

import {
  LoggerProtocol,
  LogLevel as FoundationLogLevel,
  LogEntry,
} from 'syzygy-foundation-rn';

/** Log severity levels, ordered from least to most severe. Core extends Foundation with Verbose. */
export enum LogLevel {
  Verbose = 0,
  Debug = 1,
  Info = 2,
  Warning = 3,
  Error = 4,
  Critical = 5,
}

/** A destination that receives formatted log messages. */
export interface LogDestination {
  /** Write a log entry to this destination. */
  write(message: string, level: LogLevel, metadata: Record<string, string>): void;
}

/** Log destination that writes to the console. */
export class ConsoleLogDestination implements LogDestination {
  private static readonly levelNames: Record<LogLevel, string> = {
    [LogLevel.Verbose]: 'VERBOSE',
    [LogLevel.Debug]: 'DEBUG',
    [LogLevel.Info]: 'INFO',
    [LogLevel.Warning]: 'WARNING',
    [LogLevel.Error]: 'ERROR',
    [LogLevel.Critical]: 'CRITICAL',
  };

  /** Write a log entry to the console. */
  write(message: string, level: LogLevel, metadata: Record<string, string>): void {
    const meta = Object.keys(metadata).length > 0
      ? ` ${JSON.stringify(metadata)}`
      : '';
    const line = `[${ConsoleLogDestination.levelNames[level]}] ${message}${meta}`;
    if (level >= LogLevel.Error) {
      // eslint-disable-next-line no-console
      console.error(line);
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
 * that has no Foundation counterpart (mapped to debug at the protocol boundary).
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
   * @param minLevel - Minimum log level for this destination (default: Verbose).
   */
  addDestination(destination: LogDestination, minLevel: LogLevel = LogLevel.Verbose): void {
    this.destinations.push({ destination, minLevel });
  }

  /** Map Foundation's LogLevel to Core's LogLevel. Verbose has no Foundation equivalent. */
  private static mapFoundationLevel(foundationLevel: FoundationLogLevel): LogLevel {
    switch (foundationLevel) {
      case FoundationLogLevel.Debug:    return LogLevel.Debug;
      case FoundationLogLevel.Info:     return LogLevel.Info;
      case FoundationLogLevel.Warning:  return LogLevel.Warning;
      case FoundationLogLevel.Error:    return LogLevel.Error;
      case FoundationLogLevel.Critical: return LogLevel.Critical;
      default:                          return LogLevel.Debug;
    }
  }

  /** Dispatch a message to all destinations that meet the minimum level threshold. */
  private dispatch(level: LogLevel, message: string, metadata: Record<string, string> = {}): void {
    for (const entry of this.destinations) {
      if (level >= entry.minLevel) {
        entry.destination.write(message, level, metadata);
      }
    }
  }

  /**
   * Foundation LoggerProtocol conformance entry point.
   *
   * NOTE (Tier 2): `entry.timestamp` is silently dropped — Core's
   * `LogDestination.write()` signature does not carry a timestamp.
   * Will be forwarded in Tier 2 integration (v1.1.0).
   */
  /**
   * Log a Foundation LogEntry (LoggerProtocol implementation).
   * Foundation's LogLevel is mapped to the nearest Core LogLevel.
   */
  log(entry: LogEntry): void;
  /**
   * Log a message at the specified Core level (Core extended API).
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
      const coreLevel = Logger.mapFoundationLevel(entryOrLevel.level);
      this.dispatch(coreLevel, entryOrLevel.message, entryOrLevel.metadata);
    } else {
      this.dispatch(entryOrLevel, message!, metadata);
    }
  }

  /** Log at Verbose level (Core-only extension; maps to debug at the Foundation protocol boundary). */
  verbose(message: string, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Verbose, message, metadata);
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

  /**
   * NOTE (Tier 2): The `error` parameter satisfies Foundation's `LoggerProtocol`
   * but is currently discarded at destinations. Will be forwarded in Tier 2 (v1.1.0).
   */
  /** Log at Error level. */
  error(message: string, error?: Error, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Error, message, metadata ?? {});
  }

  /**
   * NOTE (Tier 2): The `error` parameter satisfies Foundation's `LoggerProtocol`
   * but is currently discarded at destinations. Will be forwarded in Tier 2 (v1.1.0).
   */
  /** Log at Critical level. */
  critical(message: string, error?: Error, metadata?: Record<string, string>): void {
    this.dispatch(LogLevel.Critical, message, metadata ?? {});
  }
}
