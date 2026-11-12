import mongoose, { Document, Schema } from "mongoose";

export interface IMemberDocument {
  userId: string;
  label?: string;
  joinedAt: Date;
}

export interface IProjectDocument extends Document<string> {
  _id: string;
  title: string;
  description: string;
  hostId: string;
  members: IMemberDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMemberDocument>(
  {
    userId: { type: String, required: true },
    label: { type: String, default: null },
    joinedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProjectDocument>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    hostId: { type: String, required: true, index: true },
    members: [MemberSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    _id: false,
    versionKey: false
  }
);

export const ProjectModel = mongoose.model<IProjectDocument>("Project", ProjectSchema);
