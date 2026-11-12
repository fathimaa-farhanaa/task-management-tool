import { BadRequestError, UnauthorizedError } from "./errors/CustomErrors";

export interface IMember {
  userId: string;
  label?: string;
  joinedAt: Date;
}

export interface IProject {
  id: string;
  title: string;
  description?: string;
  hostId: string;
  members?: IMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class Project {
  private id: string;
  private title: string;
  private description: string;
  private hostId: string;
  private members: Map<string, IMember>;
  private createdAt: Date;
  private updatedAt: Date;

  constructor(props: IProject) {
    if (!props.title || props.title.trim().length === 0) {
      throw new BadRequestError("Project title cannot be empty");
    }
    if (!props.hostId) {
      throw new BadRequestError("Project must have a Host");
    }

    this.id = props.id;
    this.title = props.title.trim();
    this.description = props.description?.trim() ?? "";
    this.hostId = props.hostId;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();

    this.members = new Map();
    if (props.members && props.members.length > 0) {
      for (const member of props.members) {
        this.members.set(member.userId, { ...member });
      }
    }

    if (!this.members.has(this.hostId)) {
      this.members.set(this.hostId, {
        userId: this.hostId,
        label: "Host",
        joinedAt: this.createdAt
      });
    }
  }

  public get getId(): string {
    return this.id;
  }

  public get getTitle(): string {
    return this.title;
  }

  public get getDescription(): string {
    return this.description;
  }

  public get getHostId(): string {
    return this.hostId;
  }

  public get getMembers(): ReadonlyArray<IMember> {
    return Array.from(this.members.values());
  }

  public get getCreatedAt(): Date {
    return this.createdAt;
  }

  public get getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isHost(userId: string): boolean {
    return this.hostId === userId;
  }

  public isMember(userId: string): boolean {
    return this.members.has(userId);
  }

  public transferHost(callerId: string, newHostId: string): void {
    if (!this.isHost(callerId)) {
      throw new UnauthorizedError("Only the current Host can transfer project ownership");
    }
    if (callerId === newHostId) {
      throw new BadRequestError("You are already the Host of this project");
    }
    if (!this.members.has(newHostId)) {
      throw new BadRequestError("Ownership can only be transferred to an existing project member");
    }

    this.hostId = newHostId;
    this.updatedAt = new Date();
  }

  public addMember(callerId: string, newUserId: string, label?: string): void {
    if (!this.isHost(callerId)) {
      throw new UnauthorizedError("Only the Host can add members to the project");
    }
    if (this.members.has(newUserId)) {
      throw new BadRequestError("User is already a member of this project");
    }

    this.members.set(newUserId, {
      userId: newUserId,
      label: label?.trim(),
      joinedAt: new Date()
    });
    this.updatedAt = new Date();
  }

  public removeMember(callerUserId: string, targetUserId: string): void {
    const isSelfLeaving = callerUserId === targetUserId;
    const isHostAction = this.isHost(callerUserId);

    if (!isSelfLeaving && !isHostAction) {
      throw new UnauthorizedError("You are not allowed to remove this member");
    }

    if (targetUserId === this.hostId) {
      throw new BadRequestError("Host must transfer ownership before leaving or being removed");
    }

    if (!this.members.has(targetUserId)) {
      throw new BadRequestError("User is not a member of this project");
    }

    this.members.delete(targetUserId);
    this.updatedAt = new Date();
  }

  public setMemberResponsibility(callerUserId: string, targetUserId: string, label?: string): void {
    if (!this.isHost(callerUserId)) {
      throw new UnauthorizedError("Only the Host can assign responsibility labels");
    }
    const member = this.members.get(targetUserId);
    if (!member) {
      throw new BadRequestError("User is not a member of this project");
    }

    member.label = label?.trim();
    this.updatedAt = new Date();
  }

  public updateDetails(callerUserId: string, title?: string, description?: string): void {
    if (!this.isHost(callerUserId)) {
      throw new UnauthorizedError("Only the Host can update project details");
    }
    if (title !== undefined) {
      if (title.trim().length === 0) {
        throw new BadRequestError("Project title cannot be empty");
      }
      this.title = title.trim();
    }
    if (description !== undefined) {
      this.description = description.trim();
    }
    this.updatedAt = new Date();
  }
}
