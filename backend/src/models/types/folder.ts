import { Types } from "mongoose";

export interface IFolder {
  _id?: any;
  name: string;
  owner: Types.ObjectId;
  parentFolder?: Types.ObjectId;
  isDeleted?: boolean;
  starred: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
