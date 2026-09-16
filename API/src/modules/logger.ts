export enum LoggerLevelEnum {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

const LEVEL_WEIGHT: Record<LoggerLevelEnum, number> = {
  [LoggerLevelEnum.INFO]: 0,
  [LoggerLevelEnum.WARN]: 1,
  [LoggerLevelEnum.ERROR]: 2,
};

export class Logger {
  private level: LoggerLevelEnum;
  private usFormatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  constructor(level: LoggerLevelEnum) {
    this.level = level ?? LoggerLevelEnum.ERROR;
  }

  info(...args: unknown[]) {
    this.log(LoggerLevelEnum.INFO, console.log, ...args);
  }

  warn(...args: unknown[]) {
    this.log(LoggerLevelEnum.WARN, console.warn, ...args);
  }

  error(...args: unknown[]) {
    this.log(LoggerLevelEnum.ERROR, console.error, ...args);
  }

  private log(level: LoggerLevelEnum, write: (...args: unknown[]) => void, ...args: unknown[]) {
    if (LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[this.level]) {
      write(`[${level}]`, this.timestamp(), ...args);
    }
  }

  private timestamp(): string {
    return this.usFormatter.format(new Date());
  }
}

// Elysia plugin — attaches a logger instance via decorate
// so route handlers can access it as `context.logger`
import { Elysia } from "elysia";

export const loggerPlugin = (logger: Logger) => {
  return (app: Elysia) => {
    app.decorate("logger", logger);
    return app;
  };
};

// Shared instance so route modules can log without threading the plugin through every router.
export const logger = new Logger((process.env.LOGGER_LEVEL as LoggerLevelEnum) ?? LoggerLevelEnum.ERROR);

// Unwraps Drizzle's failed-query wrapper so the real database error is surfaced.
export const logError = (route: string, error: unknown): void => {
  const cause = error instanceof Error ? error.cause : undefined;

  logger.error(`[${route}]`, error, cause ? `| cause: ${String(cause)}` : "");
};
