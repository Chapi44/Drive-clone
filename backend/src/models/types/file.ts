import { Types } from "mongoose";

export interface IFile {
  name: string;
  owner: Types.ObjectId;
  parentFolder?: Types.ObjectId;
  url: string;
  mimetype: string;
  size: number;
  starred: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
