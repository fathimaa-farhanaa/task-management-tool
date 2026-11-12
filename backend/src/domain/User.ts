import { BadRequestError } from "./errors/CustomErrors";

export interface IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt?: Date;
}

export class User {
  private id: string;
  private username: string;
  private email: string;
  private passwordHash: string;
  private createdAt: Date;

  constructor(props: IUser) {
    this.validateUsername(props.username);
    this.validateEmail(props.email);

    this.id = props.id;
    this.username = props.username.trim().toLowerCase();
    this.email = props.email.trim().toLowerCase();
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt ?? new Date();
  }

  public get getId(): string {
    return this.id;
  }

  public get getUsername(): string {
    return this.username;
  }

  public get getEmail(): string {
    return this.email;
  }

  public get getPasswordHash(): string {
    return this.passwordHash;
  }

  public get getCreatedAt(): Date {
    return this.createdAt;
  }

  
  private validateUsername(username: string): void {
    if (!username || username.trim().length < 3) {
      throw new BadRequestError("Username must be at least 3 characters long");
    }
    if (/\s/.test(username)) {
      throw new BadRequestError("Username cannot contain spaces");
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      throw new BadRequestError("Invalid email address format");
    }
  }
}
