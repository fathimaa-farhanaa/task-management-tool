import { DomainError, ErrorResponse } from "./DomainError";

export class NotFoundError extends DomainError {
  public readonly statusCode = 404;
  public readonly errorCode = "NOT_FOUND";

  constructor(message: string = "Resource not found") {
    super(message);
  }

  public formatError(): ErrorResponse {
    return {
      message: this.message,
      code: this.errorCode
    };
  }
}

export class UnauthorizedError extends DomainError {
  public readonly statusCode = 403;
  public readonly errorCode = "FORBIDDEN";

  constructor(message: string = "You do not have permission to perform this action") {
    super(message);
  }

  public formatError(): ErrorResponse {
    return {
      message: this.message,
      code: this.errorCode
    };
  }
}

export class BadRequestError extends DomainError {
  public readonly statusCode = 400;
  public readonly errorCode = "BAD_REQUEST";

  constructor(message: string, public readonly details?: unknown) {
    super(message);
  }

  public formatError(): ErrorResponse {
    return {
      message: this.message,
      code: this.errorCode,
      ...(this.details ? { details: this.details } : {})
    };
  }
}

export class ConflictError extends DomainError {
  public readonly statusCode = 409;
  public readonly errorCode = "CONFLICT";

  constructor(message: string = "Resource already exists") {
    super(message);
  }

  public formatError(): ErrorResponse {
    return {
      message: this.message,
      code: this.errorCode
    };
  }
}
