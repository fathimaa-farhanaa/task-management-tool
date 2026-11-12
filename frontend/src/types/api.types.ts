export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskType = "PERSONAL" | "PROJECT";

export interface UserResponseDTO {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
}

export interface ProjectMember {
  userId: string;
  username?: string;
  label?: string;
  joinedAt: string;
}

export interface ProjectResponseDTO {
  id: string;
  title: string;
  description: string;
  hostId: string;
  members: ProjectMember[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponseDTO {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  labels: string[];
  type: TaskType;
  ownerId?: string;
  projectId?: string;
  assignedToUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardOverviewDTO {
  personalTasks: TaskResponseDTO[];
  assignedProjectTasks: TaskResponseDTO[];
  hostedProjectsCount: number;
  memberProjectsCount: number;
}
