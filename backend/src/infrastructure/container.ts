import { MongoUserRepository } from "./database/repositories/MongoUserRepository";
import { MongoProjectRepository } from "./database/repositories/MongoProjectRepository";
import { MongoTaskRepository } from "./database/repositories/MongoTaskRepository";
import { BcryptPasswordHasher } from "./security/BcryptPasswordHasher";
import { JwtTokenService } from "./security/JwtTokenService";
import { AuthService } from "../application/services/AuthService";
import { UserService } from "../application/services/UserService";
import { ProjectService } from "../application/services/ProjectService";
import { TaskService } from "../application/services/TaskService";
import { AuthController } from "./http/controllers/AuthController";
import { UserController } from "./http/controllers/UserController";
import { ProjectController } from "./http/controllers/ProjectController";
import { TaskController } from "./http/controllers/TaskController";
import { createAuthMiddleware } from "./http/middlewares/auth.middleware";
import { createApiRouter } from "./http/routes";
import { Router } from "express";


export class DependencyContainer {
  // Repositories
  public readonly userRepository = new MongoUserRepository();
  public readonly projectRepository = new MongoProjectRepository();
  public readonly taskRepository = new MongoTaskRepository();

  // Security Services
  public readonly passwordHasher = new BcryptPasswordHasher();
  public readonly tokenService = new JwtTokenService();

  // Application Services (Use Cases)
  public readonly authService = new AuthService(
    this.userRepository,
    this.passwordHasher,
    this.tokenService
  );

  public readonly userService = new UserService(this.userRepository);

  public readonly projectService = new ProjectService(
    this.projectRepository,
    this.userRepository,
    this.taskRepository
  );

  public readonly taskService = new TaskService(
    this.taskRepository,
    this.projectRepository
  );

  // Controllers
  public readonly authController = new AuthController(this.authService);
  public readonly userController = new UserController(this.userService);
  public readonly projectController = new ProjectController(this.projectService);
  public readonly taskController = new TaskController(this.taskService);

  // Middleware
  public readonly authMiddleware = createAuthMiddleware(this.tokenService);

  public createRouter(): Router {
    return createApiRouter({
      authController: this.authController,
      userController: this.userController,
      projectController: this.projectController,
      taskController: this.taskController,
      authMiddleware: this.authMiddleware
    });
  }
}

export const container = new DependencyContainer();
