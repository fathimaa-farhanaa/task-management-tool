import { NotFoundError } from "../../domain/errors/CustomErrors";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { UserResponseDTO } from "../interfaces/dtos/UserDTOs";
import { User } from "../../domain/User";

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async getProfile(userId: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return this.toDTO(user);
  }

  public async findByUsername(username: string): Promise<UserResponseDTO> {
    const user = await this.userRepository.findByUsername(username.trim().toLowerCase());
    if (!user) {
      throw new NotFoundError(`User with username '${username}' not found`);
    }
    return this.toDTO(user);
  }

  public async searchUsers(query: string): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.search(query);
    return users.map((u) => this.toDTO(u));
  }

  private toDTO(user: User): UserResponseDTO {
    return {
      id: user.getId,
      username: user.getUsername,
      email: user.getEmail,
      createdAt: user.getCreatedAt
    };
  }
}
