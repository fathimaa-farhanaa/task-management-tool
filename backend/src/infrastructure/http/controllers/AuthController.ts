import { Request, Response, NextFunction } from "express";
import { AuthService } from "../../../application/services/AuthService";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login({
        identifier: req.body.identifier,
        password: req.body.password
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
