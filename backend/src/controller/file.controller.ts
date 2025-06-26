import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  createFilesBulk,
  deleteFileById,
  getFilesByUser,
  getFilesByFolder,
  renameFile,
  getFileById,
  updateFileStarredStatus,
  getAllItemsByUser,
  getAllDeletedItemsByUser,
  deleteItemPermanently,
  createFile,
  GetAllItemsOptions,
  getItemsInFolder,
  getSubfolders,
} from "../dal/files.dal";
import { createFolder, getFolderById } from "../dal/folders.dal";
import { asyncHandler } from "../utils/asyncHandler";
import { IFolder } from "../models/types/folder";
import { Item } from "../models/types/item";


// Upload Files with internal try-catch
export const uploadFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId || !req.files) {
      return res.status(400).json({ error: "Files and authentication required" });
    }

    const files = req.files as Express.Multer.File[];
    const { parentFolder } = req.body;
    const baseURL = process.env.BASE_URL || "http://localhost:4500";

    if (parentFolder) {
      const parent = await getFolderById(parentFolder);
      if (!parent) {
        return res.status(404).json({ error: "Parent folder not found or is deleted" });
      }
    }

    const fileDocs = files.map((file) => ({
     name: file.originalname,
     size: file.size,
     url: `${baseURL}/uploads/${file.filename}`,
     owner: new Types.ObjectId(userId),
     parentFolder: parentFolder ? new Types.ObjectId(parentFolder) : undefined,
     mimetype: file.mimetype,

    }));


    const createdFiles = await createFilesBulk(fileDocs);
    res.status(201).json(createdFiles);
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "File upload failed", detail: (err as Error).message });
  }
});

// List user files with filters
export const getUserFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const starred = req.query.starred === "true"
      ? true
      : req.query.starred === "false"
      ? false
      : undefined;

    const recentDays = req.query.recentDays
      ? parseInt(req.query.recentDays as string)
      : undefined;

    const mimetypes = req.query.mimetypes
      ? Array.isArray(req.query.mimetypes)
        ? req.query.mimetypes.map((m) => typeof m === "string" ? m : String(m)).filter((m): m is string => typeof m === "string")
        : [typeof req.query.mimetypes === "string" ? req.query.mimetypes : String(req.query.mimetypes)]
      : undefined;

    const result = await getFilesByUser(
      new Types.ObjectId(userId),
      page,
      limit,
      { starred, recentDays, mimetypes }
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get user files error:", err);
    res.status(500).json({ error: "Failed to fetch files", detail: (err as Error).message });
  }
});

// Get files in a folder
export const getFilesInFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { folderId } = req.params;

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : Number.MAX_SAFE_INTEGER;

    const starred = req.query.starred === "true"
      ? true
      : req.query.starred === "false"
      ? false
      : undefined;

    const recentDays = req.query.recentDays
      ? parseInt(req.query.recentDays as string)
      : undefined;

    const mimetypes = req.query.mimetypes
      ? Array.isArray(req.query.mimetypes)
        ? req.query.mimetypes.map((m) =>
            typeof m === "string" ? m : String(m)
          ).filter((m): m is string => typeof m === "string")
        : [String(req.query.mimetypes)]
      : undefined;

    const itemType = req.query.itemType === "file" || req.query.itemType === "folder"
      ? req.query.itemType
      : undefined;

    const searchKey = typeof req.query.searchKey === "string" ? req.query.searchKey : undefined;

    const result = await getItemsInFolder(
      new Types.ObjectId(folderId),
      page,
      limit,
      { starred, recentDays, mimetypes, itemType, searchKey }
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get folder items error:", err);
    res.status(500).json({ error: "Failed to fetch folder contents", detail: (err as Error).message });
  }
});

// Soft delete a file
export const DeleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const file = await getFileById(id);

    if (!file) {
      return res.status(404).json({ message: "File not found or already deleted" });
    }

    const deleted = await deleteFileById(id);
    res.status(200).json(deleted);
  } catch (err) {
    console.error("Soft delete error:", err);
    res.status(500).json({ error: "Failed to delete file", detail: (err as Error).message });
  }
});

// Rename a file
export const renameFileController = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const file = await getFileById(id);

    if (!file) {
      return res.status(404).json({ message: "File not found or is deleted" });
    }

    const updated = await renameFile(id, name);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ error: "Failed to rename file", detail: (err as Error).message });
  }
});


export const toggleFileStarred = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { fileId } = req.params;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const file = await getFileById(fileId);

  if (!file || file.isDeleted || file.owner.toString() !== userId) {
    return res.status(404).json({ message: "File not found or already deleted" });
  }

  const toggledStarred = !file.starred;
  const updatedFile = await updateFileStarredStatus(fileId, toggledStarred);

  return res.status(200).json({
    message: `File successfully ${toggledStarred ? "starred" : "unstarred"}`,
    file: updatedFile,
  });
});


export const getUserItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : Number.MAX_SAFE_INTEGER;

    const starred = req.query.starred === "true"
      ? true
      : req.query.starred === "false"
      ? false
      : undefined;

    const recentDays = req.query.recentDays
      ? parseInt(req.query.recentDays as string)
      : undefined;

    const mimetypes = req.query.mimetypes
      ? Array.isArray(req.query.mimetypes)
        ? req.query.mimetypes.map((m) =>
            typeof m === "string" ? m : String(m)
          ).filter((m): m is string => typeof m === "string")
        : [typeof req.query.mimetypes === "string" ? req.query.mimetypes : String(req.query.mimetypes)]
      : undefined;

    const itemType = req.query.itemType === "file" || req.query.itemType === "folder"
      ? req.query.itemType
      : undefined;

    const searchKey = req.query.searchKey ? String(req.query.searchKey) : undefined;

    const result = await getAllItemsByUser(
      new Types.ObjectId(userId),
      page,
      limit,
      { starred, recentDays, mimetypes, itemType, searchKey }
    );

    return res.status(200).json(result);
  } catch (err) {
    console.error("Get user items error:", err);
    res.status(500).json({ error: "Failed to fetch user items", detail: (err as Error).message });
  }
});

export const getDeletedUserItems = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : Number.MAX_SAFE_INTEGER;

    const starred = req.query.starred === "true"
      ? true
      : req.query.starred === "false"
      ? false
      : undefined;

    const recentDays = req.query.recentDays
      ? parseInt(req.query.recentDays as string)
      : undefined;

    const mimetypes = req.query.mimetypes
      ? Array.isArray(req.query.mimetypes)
        ? req.query.mimetypes.map((m) => String(m))
        : [String(req.query.mimetypes)]
      : undefined;

    const itemType = req.query.itemType === "file" || req.query.itemType === "folder"
      ? req.query.itemType
      : undefined;

    const searchKey = typeof req.query.searchKey === "string" ? req.query.searchKey : undefined;

    const result = await getAllDeletedItemsByUser(
      new Types.ObjectId(userId),
      page,
      limit,
      { starred, recentDays, mimetypes, itemType, searchKey }
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Get deleted user items error:", err);
    res.status(500).json({ error: "Failed to fetch deleted items", detail: (err as Error).message });
  }
});


export const deleteItemPermanentlyController = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { id, itemType } = req.body;

    if (!id || (itemType !== "file" && itemType !== "folder")) {
      return res.status(400).json({ message: "Invalid request. 'id' and 'itemType' are required." });
    }

    const deleted = await deleteItemPermanently(id, itemType);

    if (!deleted) {
      return res.status(404).json({ message: "Item not found or not deleted previously." });
    }

    res.status(200).json({ message: "Item permanently deleted", item: deleted });
  } catch (err) {
    console.error("Permanent delete error:", err);
    res.status(500).json({ error: "Failed to permanently delete item", detail: (err as Error).message });
  }
});


export const createItem = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  const { itemType, parentFolder } = req.body;

  if (!itemType || (itemType !== "file" && itemType !== "folder")) {
    return res.status(400).json({ message: "Invalid or missing itemType" });
  }

  // Validate parent folder (optional)
  let parent: IFolder | null = null;
  if (parentFolder) {
    parent = await getFolderById(parentFolder);
    if (!parent) {
      return res.status(404).json({ message: "Parent folder not found or deleted" });
    }
  }

  if (itemType === "folder") {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required for folders" });

    const folderData = {
      name,
      owner: new Types.ObjectId(userId),
      parentFolder: parent ? parent._id : undefined,
    };
    const createdFolder = await createFolder(folderData);
    return res.status(201).json({ item: createdFolder, itemType: "folder" });
  }

  if (itemType === "file") {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "Files are required" });
    }

    const baseURL = process.env.BASE_URL || "http://localhost:4500";

    const fileDocs = files.map((file) => ({
      name: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      url: `${baseURL}/uploads/${file.filename}`,
      owner: new Types.ObjectId(userId),
      parentFolder: parent ? parent._id : undefined,
    }));

    const createdFiles = await createFilesBulk(fileDocs);
    return res.status(201).json({ items: createdFiles, itemType: "file" });
  }
});



export const getFolderTree = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { parentId } = req.params;
    const parentFolderId = parentId ? new Types.ObjectId(parentId) : null;

    // Recursive function using DAL only
    const buildTree = async (parentId: Types.ObjectId | null): Promise<any[]> => {
      const children = await getSubfolders(parentId || new Types.ObjectId());

      const tree = await Promise.all(
        children.map(async (folder) => {
          const subTree = await buildTree(folder._id as Types.ObjectId);
          return {
            ...folder,
            itemType: "folder",
            children: subTree,
          };
        })
      );

      return tree;
    };

    const tree = await buildTree(parentFolderId);
    return res.status(200).json(tree);
  } catch (err) {
    console.error("Folder tree fetch error:", err);
    res.status(500).json({ error: "Failed to fetch folder tree", detail: (err as Error).message });
  }
});
