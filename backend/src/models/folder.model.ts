import mongoose, { Schema, Document } from "mongoose";
import { IFolder } from "./types/folder";

export interface IFolderDocument extends Omit<IFolder, "_id">, Document {}

const FolderSchema = new Schema<IFolderDocument>(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    starred: { type: Boolean, default: false},
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IFolderDocument>("Folder", FolderSchema);
