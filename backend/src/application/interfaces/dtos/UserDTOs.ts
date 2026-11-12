export interface IUserAttributes {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export type RegisterRequestDTO = Pick<IUserAttributes, "username" | "email"> & {
  password: string;
};

export interface LoginRequestDTO {
  identifier: string;
  password: string;
}

export type UserResponseDTO = Readonly<IUserAttributes>;

export interface AuthResponseDTO {
  user: UserResponseDTO;
  token: string;
}
