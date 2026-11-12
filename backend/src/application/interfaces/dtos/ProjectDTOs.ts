import { IMember } from "../../../domain/Project";

export interface IProjectAttributes {
  id: string;
  title: string;
  description: string;
  hostId: string;
  members: ReadonlyArray<IMember>;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProjectRequestDTO = Pick<IProjectAttributes, "title"> & {
  description?: string;
};

export type UpdateProjectRequestDTO = Partial<
  Pick<IProjectAttributes, "title" | "description">
>;

export interface AddMemberRequestDTO {
  username: string;
  label?: string;
}

export interface TransferHostRequestDTO {
  newHostId: string;
}

export interface SetResponsibilityLabelRequestDTO {
  label?: string;
}

export type ProjectResponseDTO = Readonly<IProjectAttributes>;
