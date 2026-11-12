import bcrypt from "bcryptjs";
import { IPasswordHasher } from "../../application/interfaces/security/ISecurityServices";

export class BcryptPasswordHasher implements IPasswordHasher {
  private readonly saltRounds: number = 10;

  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  public async compare(plain: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plain, hash);
  }
}
