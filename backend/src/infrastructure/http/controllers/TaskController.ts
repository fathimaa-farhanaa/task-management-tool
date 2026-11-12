import { Response, NextFunction } from "express";
import { TaskService } from "../../../application/services/TaskService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../../domain/errors/CustomErrors";

export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  public createPersonal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.createPersonalTask(userId, {
        title: req.body.title,
        description: req.body.description,
        labels: req.body.labels
      });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  };

  public getPersonal = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const tasks = await this.taskService.getPersonalTasks(userId);
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  };

  public createProjectTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.createProjectTask(userId, req.params.projectId as string, {
        title: req.body.title,
        description: req.body.description,
        labels: req.body.labels,
        assignedToUserId: req.body.assignedToUserId
      });
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  };

  public getProjectTasks = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const tasks = await this.taskService.getProjectTasks(userId, req.params.projectId as string);
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  };

  public updateDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.updateTaskDetails(userId, req.params.id as string, {
        title: req.body.title,
        description: req.body.description
      });
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  public changeStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.changeTaskStatus(userId, req.params.id as string, {
        status: req.body.status
      });
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  public assign = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.assignProjectTask(userId, req.params.id as string, {
        assignedToUserId: req.body.assignedToUserId
      });
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  public unassign = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.unassignProjectTask(userId, req.params.id as string);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  public addLabel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.addLabel(userId, req.params.id as string, {
        label: req.body.label
      });
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  public removeLabel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const task = await this.taskService.removeLabel(
        userId,
        req.params.id as string,
        req.params.label as string
      );
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      await this.taskService.deleteTask(userId, req.params.id as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  public getDashboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const overview = await this.taskService.getDashboardOverview(userId);
      res.status(200).json(overview);
    } catch (err) {
      next(err);
    }
  };

  private getUserId(req: AuthenticatedRequest): string {
    if (!req.user) {
      throw new UnauthorizedError("User is not authenticated");
    }
    return req.user.id;
  }
}
