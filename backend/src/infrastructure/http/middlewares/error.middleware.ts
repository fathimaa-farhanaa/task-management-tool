import { Request, Response, NextFunction } from "express";
import { DomainError } from "../../../domain/errors/DomainError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json(err.formatError());
    return;
  }

  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_ERROR"
  });
}
