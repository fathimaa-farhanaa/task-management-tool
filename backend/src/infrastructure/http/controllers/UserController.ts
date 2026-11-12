import { Response, NextFunction } from "express";
import { UserService } from "../../../application/services/UserService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../../domain/errors/CustomErrors";

export class UserController {
  constructor(private readonly userService: UserService) {}

  public getProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User is not authenticated");
      }
      const profile = await this.userService.getProfile(req.user.id);
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  };

  public findByUsername = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const username = req.params.username as string;
      const user = await this.userService.findByUsername(username);
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  };
}
