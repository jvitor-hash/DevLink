export enum LoggerLevelEnum {
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

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
    if (this.level === LoggerLevelEnum.INFO) {
      console.log("[INFO]", this.timestamp(), ...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.level === LoggerLevelEnum.WARN) {
      console.warn("[WARN]", this.timestamp(), ...args);
    }
  }

  error(...args: unknown[]) {
    if (this.level === LoggerLevelEnum.ERROR) {
      console.error("[ERROR]", this.timestamp(), ...args);
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
