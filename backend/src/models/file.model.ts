import mongoose, { Schema, Document } from "mongoose";
import { IFile } from "./types/file";

export interface IFileDocument extends IFile, Document {}

const FileSchema = new Schema<IFileDocument>(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    starred: { type: Boolean, default: false},
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model<IFileDocument>("File", FileSchema);
