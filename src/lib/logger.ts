export type LogLevel = 'info' | 'warn' | 'error';

export interface LogEntry {
  readonly timestamp: string;
  readonly level: LogLevel;
  readonly message: string;
  readonly context?: Record<string, unknown>;
}

export function logServer(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ? { context } : {}),
  };

  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
  } else if (level === 'warn') {
    console.warn(output);
  } else {
    console.log(output);
  }

  return entry;
}
