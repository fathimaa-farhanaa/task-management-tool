import { Task } from "../../../domain/Task";

export interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: string): Promise<Task | null>;
  findPersonalTasksByOwner(ownerId: string): Promise<Task[]>;
  findProjectTasks(projectId: string): Promise<Task[]>;
  findAssignedTasksForUser(userId: string): Promise<Task[]>;
  unassignAllTasksForMember(projectId: string, memberId: string): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByProjectId(projectId: string): Promise<void>;
}
