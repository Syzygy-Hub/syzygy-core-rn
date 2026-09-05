// Logging
// Log levels, formatters, pipeline routing, and destinations.

export enum LogLevel {
  Debug = 0,
  Info = 1,
  Warning = 2,
  Error = 3,
  Fatal = 4,
}

export interface LogDestination {
  write(message: string, level: LogLevel): void;
}

export class ConsoleLogDestination implements LogDestination {
  write(message: string, level: LogLevel): void {
    console.log(`[${LogLevel[level]}] ${message}`);
  }
}

export class Logger {
  // TODO: destinations, formatters, pipeline routing, minimum level filtering
}
