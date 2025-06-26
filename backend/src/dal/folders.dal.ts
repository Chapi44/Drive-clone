import FolderModel from "../models/folder.model";
import { IFolder } from "../models/types/folder";
import { Types } from "mongoose";

// Create a folder
export const createFolder = async (folderData: Partial<IFolder>) => {
  const folder = new FolderModel(folderData);
  return await folder.save();
};

// Get folders by user (excluding soft-deleted)
export async function getFoldersByUser(
  ownerId: Types.ObjectId,
  page = 1,
  limit = 10,
  options?: { starred?: boolean; recentDays?: number }
) {
  const skip = (page - 1) * limit;

  const filter: any = { owner: ownerId, isDeleted: false };
  if (typeof options?.starred === "boolean") {
    filter.starred = options.starred;
  }

  if (options?.recentDays) {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - options.recentDays);
    filter.updatedAt = { $gte: recentDate };
  }

  const data = await FolderModel.find(filter)
    .sort({ updatedAt: -1 }) // recent first
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await FolderModel.countDocuments(filter);

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}


// Get subfolders by parent folder (excluding soft-deleted)
export const getSubfolders = async (parentFolderId: Types.ObjectId) => {
  return await FolderModel.find({ parentFolder: parentFolderId, isDeleted: false });
};

// Get folder by ID (excluding soft-deleted)
export const getFolderById = async (id: string) => {
  return await FolderModel.findOne({ _id: id, isDeleted: false });
};

// Soft delete a folder
export const deleteFolderById = async (id: string) => {
  return await FolderModel.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
};

// Rename folder
export const renameFolder = async (id: string, newName: string) => {
  return await FolderModel.findByIdAndUpdate(
    id,
    { name: newName },
    { new: true }
  );
};


// Recursive soft delete
export const cascadeDeleteFolder = async (id: string): Promise<IFolder | null> => {
  const root = await deleteFolderById(id);
  if (!root || !(root._id instanceof Types.ObjectId)) return null;

  const recurse = async (parentId: Types.ObjectId) => {
    const children = await FolderModel.find({
      parentFolder: parentId,
      isDeleted: false
    });

    for (const child of children) {
      const childId = child._id as Types.ObjectId;
      await deleteFolderById(childId.toString());
      await recurse(childId);
    }
  };

  await recurse(root._id as Types.ObjectId);
  return root;
};


export const updateFolderStarredStatus = async (
  folderId: string,
  starred: boolean,
  userId: string
) => {
  return await FolderModel.findOneAndUpdate(
    { _id: folderId, isDeleted: false, owner: userId },
    { starred },
    { new: true }
  );
};


