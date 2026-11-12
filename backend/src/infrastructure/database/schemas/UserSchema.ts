import mongoose, { Document, Schema } from "mongoose";

export interface IUserDocument extends Document<string> {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    _id: { type: String, required: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    _id: false, 
    versionKey: false
  }
);

export const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
