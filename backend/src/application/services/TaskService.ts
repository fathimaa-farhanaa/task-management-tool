import crypto from "crypto";
import { Task } from "../../domain/Task";
import { NotFoundError, UnauthorizedError, BadRequestError } from "../../domain/errors/CustomErrors";
import { ITaskRepository } from "../interfaces/repositories/ITaskRepository";
import { IProjectRepository } from "../interfaces/repositories/IProjectRepository";
import {
  AssignTaskDTO,
  ChangeTaskStatusDTO,
  CreatePersonalTaskDTO,
  CreateProjectTaskDTO,
  DashboardOverviewDTO,
  TaskLabelDTO,
  TaskResponseDTO,
  UpdateTaskRequestDTO
} from "../interfaces/dtos/TaskDTOs";

export class TaskService {
  constructor(
    private readonly taskRepository: ITaskRepository,
    private readonly projectRepository: IProjectRepository
  ) {}

  public async createPersonalTask(ownerId: string, dto: CreatePersonalTaskDTO): Promise<TaskResponseDTO> {
    const taskId = crypto.randomUUID();

    const task = new Task({
      id: taskId,
      title: dto.title,
      description: dto.description ?? "",
      labels: dto.labels,
      type: "PERSONAL",
      ownerId
    });

    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async getPersonalTasks(ownerId: string): Promise<TaskResponseDTO[]> {
    const tasks = await this.taskRepository.findPersonalTasksByOwner(ownerId);
    return tasks.map((t) => this.toDTO(t));
  }


  public async createProjectTask(
    hostId: string,
    projectId: string,
    dto: CreateProjectTaskDTO
  ): Promise<TaskResponseDTO> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    if (!project.isHost(hostId)) {
      throw new UnauthorizedError("Only the Host can create project tasks");
    }

    if (dto.assignedToUserId && !project.isMember(dto.assignedToUserId)) {
      throw new BadRequestError("Task can only be assigned to an existing project member");
    }

    const taskId = crypto.randomUUID();

    const task = new Task({
      id: taskId,
      title: dto.title,
      description: dto.description ?? "",
      labels: dto.labels,
      type: "PROJECT",
      projectId,
      assignedToUserId: dto.assignedToUserId ?? null
    });

    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async getProjectTasks(userId: string, projectId: string): Promise<TaskResponseDTO[]> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    if (!project.isMember(userId) && !project.isHost(userId)) {
      throw new UnauthorizedError("You are not a member of this project");
    }

    const tasks = await this.taskRepository.findProjectTasks(projectId);
    return tasks.map((t) => this.toDTO(t));
  }

  public async updateTaskDetails(
    userId: string,
    taskId: string,
    dto: UpdateTaskRequestDTO
  ): Promise<TaskResponseDTO> {
    const task = await this.getTask(taskId);
    let isProjectHost = false;

    if (task.getType === "PROJECT" && task.getProjectId) {
      const project = await this.projectRepository.findById(task.getProjectId);
      isProjectHost = project ? project.isHost(userId) : false;
    }

    task.updateDetails(userId, isProjectHost, dto.title, dto.description);
    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async changeTaskStatus(
    userId: string,
    taskId: string,
    dto: ChangeTaskStatusDTO
  ): Promise<TaskResponseDTO> {
    const task = await this.getTask(taskId);
    let isProjectHost = false;

    if (task.getType === "PROJECT" && task.getProjectId) {
      const project = await this.projectRepository.findById(task.getProjectId);
      isProjectHost = project ? project.isHost(userId) : false;
    }

    task.changeStatus(dto.status, userId, isProjectHost);
    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async assignProjectTask(
    hostId: string,
    taskId: string,
    dto: AssignTaskDTO
  ): Promise<TaskResponseDTO> {
    const task = await this.getTask(taskId);
    if (!task.getProjectId) {
      throw new BadRequestError("Only project tasks can be assigned");
    }

    const project = await this.projectRepository.findById(task.getProjectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    if (!project.isHost(hostId)) {
      throw new UnauthorizedError("Only the Host can assign or reassign project tasks");
    }

    if (!project.isMember(dto.assignedToUserId)) {
      throw new BadRequestError("Assignee must be an existing project member");
    }

    task.assignTo(dto.assignedToUserId, true);
    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async unassignProjectTask(hostUserId: string, taskId: string): Promise<TaskResponseDTO> {
    const task = await this.getTask(taskId);
    if (!task.getProjectId) {
      throw new BadRequestError("Only project tasks can be unassigned");
    }

    const project = await this.projectRepository.findById(task.getProjectId);
    if (!project || !project.isHost(hostUserId)) {
      throw new UnauthorizedError("Only the Host can unassign project tasks");
    }

    task.unassign();
    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async addLabel(userId: string, taskId: string, dto: TaskLabelDTO): Promise<TaskResponseDTO> {
    const task = await this.getTask(taskId);
    await this.verifyTaskModificationAccess(userId, task);

    task.addLabel(dto.label);
    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async removeLabel(userId: string, taskId: string, label: string): Promise<TaskResponseDTO> {
    const task = await this.getTask(taskId);
    await this.verifyTaskModificationAccess(userId, task);

    task.removeLabel(label);
    await this.taskRepository.save(task);
    return this.toDTO(task);
  }

  public async deleteTask(userId: string, taskId: string): Promise<void> {
    const task = await this.getTask(taskId);

    if (task.getType === "PERSONAL") {
      if (task.getOwnerId !== userId) {
        throw new UnauthorizedError("You can only delete your own personal tasks");
      }
    } else if (task.getProjectId) {
      const project = await this.projectRepository.findById(task.getProjectId);
      if (!project || !project.isHost(userId)) {
        throw new UnauthorizedError("Only the Host can delete project tasks");
      }
    }

    await this.taskRepository.delete(taskId);
  }

  public async getDashboardOverview(userId: string): Promise<DashboardOverviewDTO> {
    const personalTasks = await this.taskRepository.findPersonalTasksByOwner(userId);
    const assignedProjectTasks = await this.taskRepository.findAssignedTasksForUser(userId);
    const userProjects = await this.projectRepository.findByUserId(userId);

    const hostedProjectsCount = userProjects.filter((p) => p.isHost(userId)).length;
    const memberProjectsCount = userProjects.filter((p) => !p.isHost(userId)).length;

    return {
      personalTasks: personalTasks.map((t) => this.toDTO(t)),
      assignedProjectTasks: assignedProjectTasks.map((t) => this.toDTO(t)),
      hostedProjectsCount,
      memberProjectsCount
    };
  }

  private async getTask(taskId: string): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    return task;
  }

  private async verifyTaskModificationAccess(userId: string, task: Task): Promise<void> {
    if (task.getType === "PERSONAL") {
      if (task.getOwnerId !== userId) {
        throw new UnauthorizedError("You can only modify your own personal tasks");
      }
    } else if (task.getProjectId) {
      const project = await this.projectRepository.findById(task.getProjectId);
      if (!project || !project.isHost(userId)) {
        throw new UnauthorizedError("Only the Host can modify project tasks");
      }
    }
  }

  private toDTO(task: Task): TaskResponseDTO {
    return {
      id: task.getId,
      title: task.getTitle,
      description: task.getDescription,
      status: task.getStatus,
      labels: task.getLabels,
      type: task.getType,
      ownerId: task.getOwnerId,
      projectId: task.getProjectId,
      assignedToUserId: task.getAssignedToUserId,
      createdAt: task.getCreatedAt,
      updatedAt: task.getUpdatedAt
    };
  }
}
