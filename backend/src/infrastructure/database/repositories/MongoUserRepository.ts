import { User } from "../../../domain/User";
import { IUserRepository } from "../../../application/interfaces/repositories/IUserRepository";
import { UserModel, IUserDocument } from "../schemas/UserSchema";

export class MongoUserRepository implements IUserRepository {
  public async save(user: User): Promise<void> {
    await UserModel.findByIdAndUpdate(
      user.getId,
      {
        _id: user.getId,
        username: user.getUsername,
        email: user.getEmail,
        passwordHash: user.getPasswordHash,
        createdAt: user.getCreatedAt
      },
      { upsert: true, new: true }
    );
  }

  public async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? this.toDomain(doc) : null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username: username.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.toLowerCase() });
    return doc ? this.toDomain(doc) : null;
  }

  public async findByUsernameOrEmail(identifier: string): Promise<User | null> {
    const clean = identifier.trim().toLowerCase();
    const doc = await UserModel.findOne({
      $or: [{ username: clean }, { email: clean }]
    });
    return doc ? this.toDomain(doc) : null;
  }

  private toDomain(doc: IUserDocument): User {
    return new User({
      id: doc._id,
      username: doc.username,
      email: doc.email,
      passwordHash: doc.passwordHash,
      createdAt: doc.createdAt
    });
  }
}
