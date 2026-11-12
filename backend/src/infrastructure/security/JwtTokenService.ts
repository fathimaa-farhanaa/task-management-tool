import jwt, { SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "../../domain/errors/CustomErrors";
import { ITokenPayload, ITokenService } from "../../application/interfaces/security/ISecurityServices";


export class JwtTokenService implements ITokenService {
  private readonly secretKey: string;
  private readonly expiresIn: string;

  constructor(
    secretKey: string = process.env.JWT_SECRET || "fallback_super_secret_key_change_in_production",
    expiresIn: string = "7d"
  ) {
    this.secretKey = secretKey;
    this.expiresIn = expiresIn;
  }

  public generateToken(payload: ITokenPayload): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn as any
    };
    return jwt.sign({ id: payload.id, username: payload.username }, this.secretKey, options);
  }

  public verifyToken(token: string): ITokenPayload {
    try {
      const decoded = jwt.verify(token, this.secretKey) as { id: string; username: string };
      return {
        id: decoded.id,
        username: decoded.username
      };
    } catch {
      throw new UnauthorizedError("Invalid or expired authentication token");
    }
  }
}
