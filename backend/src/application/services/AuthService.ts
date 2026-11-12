import crypto from "crypto";
import { User } from "../../domain/User";
import { ConflictError, UnauthorizedError } from "../../domain/errors/CustomErrors";
import { IUserRepository } from "../interfaces/repositories/IUserRepository";
import { IPasswordHasher, ITokenService } from "../interfaces/security/ISecurityServices";
import {
  AuthResponseDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  UserResponseDTO
} from "../interfaces/dtos/UserDTOs";

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  public async register(dto: RegisterRequestDTO): Promise<AuthResponseDTO> {
    const existingUsername = await this.userRepository.findByUsername(dto.username);
    if (existingUsername) {
      throw new ConflictError("Username is already taken");
    }

    const existingEmail = await this.userRepository.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError("Email is already registered");
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const userId = crypto.randomUUID();

    const user = new User({
      id: userId,
      username: dto.username,
      email: dto.email,
      passwordHash
    });

    await this.userRepository.save(user);

    const token = this.tokenService.generateToken({
      id: user.getId,
      username: user.getUsername
    });

    return {
      user: this.toDTO(user),
      token
    };
  }

  public async login(dto: LoginRequestDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepository.findByUsernameOrEmail(dto.identifier);
    if (!user) {
      throw new UnauthorizedError("Invalid username/email or password");
    }

    const isValidPassword = await this.passwordHasher.compare(dto.password, user.getPasswordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid username/email or password");
    }

    const token = this.tokenService.generateToken({
      id: user.getId,
      username: user.getUsername
    });

    return {
      user: this.toDTO(user),
      token
    };
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
