import FileModel from "../models/file.model";
import { IFile } from "../models/types/file";
import { Types } from "mongoose";
import { IFolder } from "../models/types/folder";
import FolderModel from "../models/folder.model";

type Item = (IFile | IFolder) & { itemType: "file" | "folder" };

export type GetAllItemsOptions = {
  starred?: boolean;
  recentDays?: number;
  mimetypes?: string[];
  itemType?: "file" | "folder";
  searchKey?: string;
};

// Create a file
export const createFile = async (fileData: Partial<IFile>) => {
  const file = new FileModel(fileData);
  return await file.save();
};
// Bulk create files
export const createFilesBulk = async (filesData: Partial<IFile>[]) => {
  return await FileModel.insertMany(filesData);
};
// Get all files by user (excluding soft-deleted)
export async function getFilesByUser(
  ownerId: Types.ObjectId,
  page = 1,
  limit = 10,
  options?: { starred?: boolean; recentDays?: number; mimetypes?: string[] }
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

  if (options?.mimetypes && options.mimetypes.length > 0) {
    filter.mimetype = { $in: options.mimetypes };
  }

  const files = await FileModel.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await FileModel.countDocuments(filter);

  return {
    data: files,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}


// Get files by folder (excluding soft-deleted)
export const getFilesByFolder = async (
  folderId: Types.ObjectId,
  page = 1,
  limit = 10,
  options?: { starred?: boolean; recentDays?: number; mimetypes?: string[] }
) => {
  const skip = (page - 1) * limit;

  const filter: any = {
    parentFolder: folderId,
    isDeleted: false,
  };

  if (typeof options?.starred === "boolean") {
    filter.starred = options.starred;
  }

  if (options?.recentDays) {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - options.recentDays);
    filter.updatedAt = { $gte: recentDate };
  }

  if (options?.mimetypes && options.mimetypes.length > 0) {
    filter.mimetype = { $in: options.mimetypes };
  }

  const files = await FileModel.find(filter)
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();

  const total = await FileModel.countDocuments(filter);

  return {
    data: files,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};


// Get file by ID (only if not soft-deleted)
export const getFileById = async (id: string) => {
  return await FileModel.findOne({ _id: id, isDeleted: false });
};

// Soft delete a file
export const deleteFileById = async (id: string) => {
  return await FileModel.findByIdAndUpdate(
    id,
    { isDeleted: true, deletedAt: new Date() },
    { new: true }
  );
};

// Rename file
export const renameFile = async (id: string, newName: string) => {
  return await FileModel.findByIdAndUpdate(
    id,
    { name: newName },
    { new: true }
  );
};


export const updateFileStarredStatus = async (fileId: string, starred: boolean) => {
  return await FileModel.findOneAndUpdate(
    { _id: fileId, isDeleted: false },
    { starred },
    { new: true }
  );
};



export const getAllItemsByUser = async (
  ownerId: Types.ObjectId,
  page: number = 1,
  limit: number = Number.MAX_SAFE_INTEGER,
  options?: GetAllItemsOptions
): Promise<{
  data: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;

  const folderFilter: any = { owner: ownerId, isDeleted: false };
  const fileFilter: any = { owner: ownerId, isDeleted: false };

  if (typeof options?.starred === "boolean") {
    folderFilter.starred = options.starred;
    fileFilter.starred = options.starred;
  }

  if (options?.recentDays) {
    const since = new Date();
    since.setDate(since.getDate() - options.recentDays);
    folderFilter.createdAt = { $gte: since };
    fileFilter.createdAt = { $gte: since };
  }

  if (options?.mimetypes?.length) {
    fileFilter.mimetype = { $in: options.mimetypes };
  }

  if (options?.searchKey) {
    const nameRegex = new RegExp(options.searchKey, "i");
    folderFilter.name = { $regex: nameRegex };
    fileFilter.name = { $regex: nameRegex };
  }

  const [folders, files] = await Promise.all([
    FolderModel.find(folderFilter).lean(),
    FileModel.find(fileFilter).lean(),
  ]);

  const foldersWithType: Item[] = folders.map((f) => ({ ...f, itemType: "folder" }));
  const filesWithType: Item[] = files.map((f) => ({ ...f, itemType: "file" }));

  let combined: Item[] = [];

  if (options?.itemType === "folder") {
    combined = foldersWithType;
  } else if (options?.itemType === "file") {
    combined = filesWithType;
  } else {
    combined = [...foldersWithType, ...filesWithType];
  }

  combined.sort((a, b) => {
    if (a.itemType !== b.itemType) {
      return a.itemType === "folder" ? -1 : 1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const paged = combined.slice(skip, skip + limit);

  return {
    data: paged,
    page,
    limit,
    total: combined.length,
    totalPages: Math.ceil(combined.length / limit),
  };
};





export const getAllDeletedItemsByUser = async (
  ownerId: Types.ObjectId,
  page: number = 1,
  limit: number = Number.MAX_SAFE_INTEGER,
  options?: GetAllItemsOptions
): Promise<{
  data: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;

  const folderFilter: any = { owner: ownerId, isDeleted: true };
  const fileFilter: any = { owner: ownerId, isDeleted: true };

  if (typeof options?.starred === "boolean") {
    folderFilter.starred = options.starred;
    fileFilter.starred = options.starred;
  }

  if (options?.recentDays) {
    const since = new Date();
    since.setDate(since.getDate() - options.recentDays);
    folderFilter.createdAt = { $gte: since };
    fileFilter.createdAt = { $gte: since };
  }

  if (options?.mimetypes?.length) {
    fileFilter.mimetype = { $in: options.mimetypes };
  }

  if (options?.searchKey) {
    const nameRegex = new RegExp(options.searchKey, "i");
    folderFilter.name = { $regex: nameRegex };
    fileFilter.name = { $regex: nameRegex };
  }

  const [folders, files] = await Promise.all([
    FolderModel.find(folderFilter).lean(),
    FileModel.find(fileFilter).lean(),
  ]);

  const foldersWithType: Item[] = folders.map((f) => ({ ...f, itemType: "folder" }));
  const filesWithType: Item[] = files.map((f) => ({ ...f, itemType: "file" }));

  let combined: Item[] = [];

  if (options?.itemType === "folder") {
    combined = foldersWithType;
  } else if (options?.itemType === "file") {
    combined = filesWithType;
  } else {
    combined = [...foldersWithType, ...filesWithType];
  }

  combined.sort((a, b) => {
    if (a.itemType !== b.itemType) {
      return a.itemType === "folder" ? -1 : 1;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const paged = combined.slice(skip, skip + limit);

  return {
    data: paged,
    page,
    limit,
    total: combined.length,
    totalPages: Math.ceil(combined.length / limit),
  };
};


export const deleteItemPermanently = async (
  id: string,
  itemType: "file" | "folder"
): Promise<null | IFile | IFolder> => {
  if (itemType === "file") {
    return await FileModel.findOneAndDelete({ _id: id, isDeleted: true });
  } else {
    return await FolderModel.findOneAndDelete({ _id: id, isDeleted: true });
  }
};


export const getItemsInFolder = async (
  parentFolderId: Types.ObjectId,
  page: number = 1,
  limit: number = Number.MAX_SAFE_INTEGER,
  options?: GetAllItemsOptions
): Promise<{
  data: Item[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}> => {
  const skip = (page - 1) * limit;

  const folderFilter: any = { parentFolder: parentFolderId, isDeleted: false };
  const fileFilter: any = { parentFolder: parentFolderId, isDeleted: false };

  if (typeof options?.starred === "boolean") {
    folderFilter.starred = options.starred;
    fileFilter.starred = options.starred;
  }

  if (options?.recentDays) {
    const since = new Date();
    since.setDate(since.getDate() - options.recentDays);
    folderFilter.createdAt = { $gte: since };
    fileFilter.createdAt = { $gte: since };
  }

  if (options?.mimetypes?.length) {
    fileFilter.mimetype = { $in: options.mimetypes };
  }

  if (options?.searchKey) {
    const regex = new RegExp(options.searchKey, "i");
    folderFilter.name = { $regex: regex };
    fileFilter.name = { $regex: regex };
  }

  const [folders, files] = await Promise.all([
    FolderModel.find(folderFilter).lean(),
    FileModel.find(fileFilter).lean(),
  ]);

  const foldersWithType: Item[] = folders.map((f) => ({ ...f, itemType: "folder" }));
  const filesWithType: Item[] = files.map((f) => ({ ...f, itemType: "file" }));

  let combined: Item[] = [];

  if (options?.itemType === "folder") {
    combined = foldersWithType;
  } else if (options?.itemType === "file") {
    combined = filesWithType;
  } else {
    combined = [...foldersWithType, ...filesWithType];
  }

  combined.sort((a, b) => {
    if (a.itemType !== b.itemType) return a.itemType === "folder" ? -1 : 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const paged = combined.slice(skip, skip + limit);

  return {
    data: paged,
    page,
    limit,
    total: combined.length,
    totalPages: Math.ceil(combined.length / limit),
  };
};


export const getSubfolders = async (parentFolderId: Types.ObjectId) => {
  return await FolderModel.find({ parentFolder: parentFolderId, isDeleted: false }).lean();
};