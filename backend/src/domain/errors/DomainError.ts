export interface ErrorResponse {
  message: string;
  code: string;
}

export abstract class DomainError extends Error {
  public abstract readonly statusCode: number;
  public abstract readonly errorCode: string;

  constructor(message: string) {
    super(message);
  }

  public abstract formatError(): ErrorResponse;
}
