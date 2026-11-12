import { BadRequestError, UnauthorizedError } from "./errors/CustomErrors";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type TaskType = "PERSONAL" | "PROJECT";

export interface ITask {
  id: string;
  title: string;
  description: string;
  status?: TaskStatus;
  labels?: string[];
  type: TaskType;
  ownerId?: string;           
  projectId?: string;         
  assignedToUserId?: string | null; 
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task {
  private id: string;
  private title: string;
  private description: string;
  private status: TaskStatus;
  private labels: Set<string>;
  private type: TaskType;
  private ownerId?: string;
  private projectId?: string;
  private assignedToUserId: string | null;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: ITask) {
    if (!props.title || props.title.trim().length === 0) {
      throw new BadRequestError("Task title cannot be empty");
    }

    if (props.type === "PERSONAL" && !props.ownerId) {
      throw new BadRequestError("Personal task must have an owner");
    }

    if (props.type === "PROJECT" && !props.projectId) {
      throw new BadRequestError("Project task must belong to a project");
    }

    this.id = props.id;
    this.title = props.title.trim();
    this.description = props.description?.trim() ?? "";
    this.status = props.status ?? "TODO";
    this.labels = new Set(props.labels?.map((l) => l.trim().toLowerCase()) ?? []);
    this.type = props.type;
    this.ownerId = props.ownerId;
    this.projectId = props.projectId;
    this.assignedToUserId = props.assignedToUserId ?? null;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  // Getters
  public get getId(): string {
    return this.id;
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDescription(): string {
    return this.description;
  }

  public get getStatus(): TaskStatus {
    return this.status;
  }

  public get getLabels(): ReadonlyArray<string> {
    return Array.from(this.labels);
  }

  public get getType(): TaskType {
    return this.type;
  }

  public get getOwnerId(): string | undefined {
    return this.ownerId;
  }

  public get getProjectId(): string | undefined {
    return this.projectId;
  }

  public get getAssignedToUserId(): string | null {
    return this.assignedToUserId;
  }

  public get getCreatedAt(): Date {
    return this.createdAt;
  }

  public get getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public changeStatus(newStatus: TaskStatus, callerId: string, isProjectHost: boolean = false): void {
    const validStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "COMPLETED"];
    if (!validStatuses.includes(newStatus)) {
      throw new BadRequestError(`Invalid task status: ${newStatus}`);
    }

    if (this.type === "PERSONAL") {
      if (this.ownerId !== callerId) {
        throw new UnauthorizedError("You can only update the status of your own tasks");
      }
    } else {
      const isAssignee = this.assignedToUserId === callerId;
      const canUpdate = isAssignee || isProjectHost;
      if (!canUpdate) {
        throw new UnauthorizedError("Members can only update the status of tasks assigned to themselves");
      }
    }

    this.status = newStatus;
    this.updatedAt = new Date();
  }

  public assignTo(newAssigneeId: string, isProjectHost: boolean): void {
    if (this.type !== "PROJECT") {
      throw new BadRequestError("Only project tasks can be assigned");
    }
    if (!isProjectHost) {
      throw new UnauthorizedError("Only the Host can assign or reassign project tasks");
    }

    this.assignedToUserId = newAssigneeId;
    this.updatedAt = new Date();
  }

  public unassign(): void {
    if (this.type !== "PROJECT") {
      throw new BadRequestError("Only project tasks can be unassigned");
    }
    this.assignedToUserId = null;
    this.updatedAt = new Date();
  }

  public updateDetails(callerId: string, isProjectHost: boolean, title?: string, description?: string): void {
    if (this.type === "PERSONAL") {
      if (this.ownerId !== callerId) {
        throw new UnauthorizedError("You can only modify your own personal tasks");
      }
    } else {
      if (!isProjectHost) {
        throw new UnauthorizedError("Only the Host can modify project task details");
      }
    }

    if (title !== undefined) {
      if (title.trim().length === 0) {
        throw new BadRequestError("Task title cannot be empty");
      }
      this.title = title.trim();
    }

    if (description !== undefined) {
      this.description = description.trim();
    }

    this.updatedAt = new Date();
  }

  public addLabel(label: string): void {
    const trimmedLabel = label.trim().toLowerCase();
    if (trimmedLabel.length > 0) {
      this.labels.add(trimmedLabel);
      this.updatedAt = new Date();
    }
  }

  public removeLabel(label: string): void {
    this.labels.delete(label.trim().toLowerCase());
    this.updatedAt = new Date();
  }
}
