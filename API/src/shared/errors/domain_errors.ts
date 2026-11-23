export const HttpStatus = {
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export class DomainError extends Error {
  constructor(message: string, readonly status: HttpStatusCode = HttpStatus.BAD_REQUEST) {
    super(message);
    this.name = "DomainError";
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string) { super(message, HttpStatus.FORBIDDEN); }
}

export class NotFoundError extends DomainError {
  constructor(message: string) { super(message, HttpStatus.NOT_FOUND); }
}

export class ConflictError extends DomainError {
  constructor(message: string) { super(message, HttpStatus.CONFLICT); }
}

export class ValidationError extends DomainError {
  constructor(message: string) { super(message, HttpStatus.UNPROCESSABLE_ENTITY); }
}
