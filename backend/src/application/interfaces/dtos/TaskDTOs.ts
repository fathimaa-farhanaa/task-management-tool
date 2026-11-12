import { TaskStatus, TaskType } from "../../../domain/Task";

export interface ITaskAttributes {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  labels: ReadonlyArray<string>;
  type: TaskType;
  ownerId?: string;
  projectId?: string;
  assignedToUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePersonalTaskDTO = Pick<ITaskAttributes, "title"> & {
  description?: string;
  labels?: string[];
};

export type CreateProjectTaskDTO = Pick<ITaskAttributes, "title"> & {
  description?: string;
  labels?: string[];
  assignedToUserId?: string | null;
};

export type UpdateTaskRequestDTO = Partial<
  Pick<ITaskAttributes, "title" | "description">
>;

export interface ChangeTaskStatusDTO {
  status: TaskStatus;
}

export interface AssignTaskDTO {
  assignedToUserId: string;
}

export interface TaskLabelDTO {
  label: string;
}

export type TaskResponseDTO = Readonly<ITaskAttributes>;

export interface DashboardOverviewDTO {
  personalTasks: ReadonlyArray<TaskResponseDTO>;
  assignedProjectTasks: ReadonlyArray<TaskResponseDTO>;
  hostedProjectsCount: number;
  memberProjectsCount: number;
}
