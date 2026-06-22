/**
 * Simple logger utility for the LinkedIn Publisher backend.
 * Provides structured logging with timestamps and log levels.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogData {
  [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, data?: LogData): string {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...data,
  };
  return JSON.stringify(logEntry);
}

export const logger = {
  info: (message: string, data?: LogData) => {
    console.log(formatLog('info', message, data));
  },

  warn: (message: string, data?: LogData) => {
    console.warn(formatLog('warn', message, data));
  },

  error: (message: string, data?: LogData) => {
    console.error(formatLog('error', message, data));
  },

  debug: (message: string, data?: LogData) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', message, data));
    }
  },
};
