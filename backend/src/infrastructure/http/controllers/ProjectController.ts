import { Response, NextFunction } from "express";
import { ProjectService } from "../../../application/services/ProjectService";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UnauthorizedError } from "../../../domain/errors/CustomErrors";

export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const project = await this.projectService.createProject(userId, {
        title: req.body.title,
        description: req.body.description
      });
      res.status(201).json(project);
    } catch (err) {
      next(err);
    }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const project = await this.projectService.getProjectById(userId, req.params.id as string);
      res.status(200).json(project);
    } catch (err) {
      next(err);
    }
  };

  public getUserProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const projects = await this.projectService.getUserProjects(userId);
      res.status(200).json(projects);
    } catch (err) {
      next(err);
    }
  };

  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const updated = await this.projectService.updateProject(userId, req.params.id as string, {
        title: req.body.title,
        description: req.body.description
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  public addMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.getUserId(req);
      const updated = await this.projectService.addMember(userId, req.params.id as string, {
        username: req.body.username,
        label: req.body.label
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  public removeMember = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const callerId = this.getUserId(req);
      const updated = await this.projectService.removeMember(
        callerId,
        req.params.id as string,
        req.params.userId as string
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  public transferOwnership = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const callerId = this.getUserId(req);
      const updated = await this.projectService.transferOwnership(callerId, req.params.id as string, {
        newHostId: req.body.newHostId
      });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  public setResponsibility = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const callerId = this.getUserId(req);
      const updated = await this.projectService.setResponsibilityLabel(
        callerId,
        req.params.id as string,
        req.params.userId as string,
        {
          label: req.body.label
        }
      );
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const callerId = this.getUserId(req);
      await this.projectService.deleteProject(callerId, req.params.id as string);
      res.status(204).send();
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
