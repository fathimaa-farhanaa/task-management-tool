export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}

export interface ITokenPayload {
  id: string;
  username: string;
}

export interface ITokenService {
  generateToken(payload: ITokenPayload): string;
  verifyToken(token: string): ITokenPayload;
}
