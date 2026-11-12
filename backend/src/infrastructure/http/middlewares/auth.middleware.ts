import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../../application/interfaces/security/ISecurityServices";
import { UnauthorizedError } from "../../../domain/errors/CustomErrors";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
  };
}

export function createAuthMiddleware(tokenService: ITokenService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Authentication token is missing"));
    }

    const token = authHeader.substring(7); 
    try {
      const payload = tokenService.verifyToken(token);
      req.user = payload;
      next();
    } catch (err) {
      next(err);
    }
  };
}
