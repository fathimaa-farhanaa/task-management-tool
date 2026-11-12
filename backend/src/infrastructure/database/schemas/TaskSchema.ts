import mongoose, { Document, Schema } from "mongoose";

export interface ITaskDocument extends Document<string> {
  _id: string;
  title: string;
  description: string;
  status: "TODO" | "IN_PROGRESS" | "COMPLETED";
  labels: string[];
  type: "PERSONAL" | "PROJECT";
  ownerId?: string;
  projectId?: string;
  assignedToUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "COMPLETED"],
      default: "TODO"
    },
    labels: [{ type: String }],
    type: {
      type: String,
      enum: ["PERSONAL", "PROJECT"],
      required: true,
      index: true
    },
    ownerId: { type: String, index: true },
    projectId: { type: String, index: true },
    assignedToUserId: { type: String, default: null, index: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    _id: false,
    versionKey: false
  }
);

export const TaskModel = mongoose.model<ITaskDocument>("Task", TaskSchema);
