import crypto from "crypto";
import { Project } from "../../domain/Project";
import { NotFoundError, UnauthorizedError } from "../../domain/errors/CustomErrors";
import { IProjectRepository } from "../interfaces/repositories/IProjectRepository";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { ITaskRepository } from "../interfaces/repositories/ITaskRepository";
import {
  AddMemberRequestDTO,
  CreateProjectRequestDTO,
  ProjectResponseDTO,
  SetResponsibilityLabelRequestDTO,
  TransferHostRequestDTO,
  UpdateProjectRequestDTO
} from "../interfaces/dtos/ProjectDTOs";

export class ProjectService {
  constructor(
    private readonly projectRepository: IProjectRepository,
    private readonly userRepository: IUserRepository,
    private readonly taskRepository: ITaskRepository
  ) {}

  public async createProject(hostId: string, dto: CreateProjectRequestDTO): Promise<ProjectResponseDTO> {
    const projectId = crypto.randomUUID();

    const project = new Project({
      id: projectId,
      title: dto.title,
      description: dto.description,
      hostId: hostId
    });

    await this.projectRepository.save(project);
    return this.toDTO(project);
  }

  public async getProjectById(userId: string, projectId: string): Promise<ProjectResponseDTO> {
    const project = await this.getProject(projectId);

    if (!project.isMember(userId) && !project.isHost(userId)) {
      throw new UnauthorizedError("You are not a member of this project");
    }

    return this.toDTO(project);
  }

  public async getUserProjects(userId: string): Promise<ProjectResponseDTO[]> {
    const projects = await this.projectRepository.findByUserId(userId);
    return projects.map((p) => this.toDTO(p));
  }

  public async updateProject(userId: string, projectId: string, dto: UpdateProjectRequestDTO ): 
  Promise<ProjectResponseDTO> {
    const project = await this.getProject(projectId);
    project.updateDetails(userId, dto.title, dto.description);

    await this.projectRepository.save(project);
    return this.toDTO(project);
  }

  public async addMember(
    hostId: string,
    projectId: string,
    dto: AddMemberRequestDTO
  ): Promise<ProjectResponseDTO> {
    const project = await this.getProject(projectId);

    const userToAdd = await this.userRepository.findByUsername(dto.username.trim().toLowerCase());
    if (!userToAdd) {
      throw new NotFoundError(`User with username '${dto.username}' not found`);
    }

    project.addMember(hostId, userToAdd.getId, dto.label);
    await this.projectRepository.save(project);
    return this.toDTO(project);
  }

  public async removeMember( callerId: string, projectId: string, targetUserId: string):
  Promise<ProjectResponseDTO> {
    const project = await this.getProject(projectId);

    project.removeMember(callerId, targetUserId);
    await this.projectRepository.save(project);

    await this.taskRepository.unassignAllTasksForMember(projectId, targetUserId);

    return this.toDTO(project);
  }

  public async transferOwnership(
    callerId: string,
    projectId: string,
    dto: TransferHostRequestDTO
  ): Promise<ProjectResponseDTO> {
    const project = await this.getProject(projectId);

    project.transferHost(callerId, dto.newHostId);
    await this.projectRepository.save(project);
    return this.toDTO(project);
  }

  public async setResponsibilityLabel(
    hostId: string,
    projectId: string,
    targetUserId: string,
    dto: SetResponsibilityLabelRequestDTO
  ): Promise<ProjectResponseDTO> {
    const project = await this.getProject(projectId);

    project.setMemberResponsibility(hostId, targetUserId, dto.label);
    await this.projectRepository.save(project);
    return this.toDTO(project);
  }

  public async deleteProject(hostUserId: string, projectId: string): Promise<void> {
    const project = await this.getProject(projectId);

    if (!project.isHost(hostUserId)) {
      throw new UnauthorizedError("Only the Host can delete the project");
    }

    await this.taskRepository.deleteByProjectId(projectId);
    await this.projectRepository.delete(projectId);
  }

  private async getProject(projectId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }
    return project;
  }

  private toDTO(project: Project): ProjectResponseDTO {
    return {
      id: project.getId,
      title: project.getTitle,
      description: project.getDescription,
      hostId: project.getHostId,
      members: project.getMembers,
      createdAt: project.getCreatedAt,
      updatedAt: project.getUpdatedAt
    };
  }
}
