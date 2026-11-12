import { Router, RequestHandler } from "express";
import { AuthController } from "../controllers/AuthController";
import { UserController } from "../controllers/UserController";
import { ProjectController } from "../controllers/ProjectController";
import { TaskController } from "../controllers/TaskController";
import { createAuthRoutes } from "./auth.routes";
import { createUserRoutes } from "./user.routes";
import { createProjectRoutes } from "./project.routes";
import { createTaskRoutes } from "./task.routes";

export interface RouteControllers {
  authController: AuthController;
  userController: UserController;
  projectController: ProjectController;
  taskController: TaskController;
  authMiddleware: RequestHandler;
}

export function createApiRouter(controllers: RouteControllers): Router {
  const router = Router();

  router.use("/auth", createAuthRoutes(controllers.authController));
  router.use("/users", createUserRoutes(controllers.userController, controllers.authMiddleware));
  router.use("/projects", createProjectRoutes(controllers.projectController, controllers.authMiddleware));
  router.use("/tasks", createTaskRoutes(controllers.taskController, controllers.authMiddleware));

  return router;
}
