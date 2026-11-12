import { Router, RequestHandler } from "express";
import { UserController } from "../controllers/UserController";

export function createUserRoutes(
  userController: UserController,
  authMiddleware: RequestHandler
): Router {
  const router = Router();

  router.use(authMiddleware);

  router.get("/me", userController.getProfile);
  router.get("/search", userController.search);
  router.get("/:username", userController.findByUsername);

  return router;
}
