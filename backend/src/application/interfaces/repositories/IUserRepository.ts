import { User } from "../../../domain/User";

export interface IUserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsernameOrEmail(identifier: string): Promise<User | null>;
  search(query: string, limit?: number): Promise<User[]>;
}
