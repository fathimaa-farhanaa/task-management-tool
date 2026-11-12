import { Project } from "../../../domain/Project";

export interface IProjectRepository {
  save(project: Project): Promise<void>;
  findById(id: string): Promise<Project | null>;
  findByUserId(userId: string): Promise<Project[]>;
  delete(id: string): Promise<void>;
}
