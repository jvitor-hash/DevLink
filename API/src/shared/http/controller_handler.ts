import type { Context } from "elysia";
import { DomainError, HttpStatus, type HttpStatusCode } from "@/shared/errors/domain_errors";
import { logger } from "@/modules/logger";

export type ErrorResponse = { error: string };
export type ResponseContext = Pick<Context, "set">;

export const executeController = async <Result>(
  set: ResponseContext["set"],
  operation: () => Promise<Result>,
  fallbackMessage: string,
  fallbackStatus: HttpStatusCode,
): Promise<Result | ErrorResponse> => {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof DomainError) {
      logger.warn("[controller] domain failure", { message: error.message, status: error.status });
      set.status = error.status;
      return { error: error.message };
    }

    logger.error("[controller] unexpected failure", { fallbackMessage, error });
    set.status = fallbackStatus;
    return { error: fallbackMessage };
  }
};

export const requireRole = (role: string, expectedRole: string, message: string): void => {
  if (role !== expectedRole) {
    throw new DomainError(message, HttpStatus.FORBIDDEN);
  }
};

export const requireSameUser = (requestedUserId: string, authenticatedUserId: string): void => {
  if (requestedUserId !== authenticatedUserId) {
    throw new DomainError("Forbidden", HttpStatus.FORBIDDEN);
  }
};

export const requireValue = <Result>(value: Result | null | undefined, message: string): Result => {
  if (value === null || value === undefined) {
    throw new DomainError(message, 404);
  }
  return value;
};
