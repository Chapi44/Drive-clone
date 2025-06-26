import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./types/user";

export interface IUserDocument extends IUser, Document {}

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model<IUserDocument>("User", UserSchema);
export default UserModel;
