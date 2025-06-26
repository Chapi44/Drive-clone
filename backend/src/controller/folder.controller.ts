import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../middlewares/auth.middleware";
import {
  cascadeDeleteFolder,
  createFolder,
  getFolderById,
  getFoldersByUser,
  getSubfolders,
  renameFolder,
  updateFolderStarredStatus,
} from "../dal/folders.dal";
import { asyncHandler } from "../utils/asyncHandler";

// Create a new folder
export const createNewFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { name, parentFolder } = req.body;
    const userId = req.user?.userId;

    if (!name || !userId) {
      return res.status(400).json({ error: "Name and authentication required" });
    }

    if (parentFolder) {
      const existingParent = await getFolderById(parentFolder);
      if (!existingParent || existingParent.isDeleted) {
        return res.status(404).json({ error: "Parent folder not found or is deleted" });
      }
    }

    const folder = await createFolder({
      name,
      owner: new Types.ObjectId(userId),
      parentFolder: parentFolder ? new Types.ObjectId(parentFolder) : undefined,
    });

    res.status(201).json(folder);
  } catch (err) {
    console.error("Create folder error:", err);
    res.status(500).json({ error: "Failed to create folder", detail: (err as Error).message });
  }
});

// Get all folders of a user
export const getUserFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const starred = req.query.starred === "true" ? true : req.query.starred === "false" ? false : undefined;
    const recentDays = req.query.recentDays ? parseInt(req.query.recentDays as string) : undefined;

    const result = await getFoldersByUser(
      new Types.ObjectId(userId),
      page,
      limit,
      { starred, recentDays }
    );

    res.status(200).json(result);
  } catch (err) {
    console.error("Get user folders error:", err);
    res.status(500).json({ error: "Failed to fetch folders", detail: (err as Error).message });
  }
});

// Get subfolders of a folder
export const getSubFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { parentId } = req.params;

    const parent = await getFolderById(parentId);
    if (!parent || parent.isDeleted) {
      return res.status(404).json({ message: "Parent folder not found or is deleted" });
    }

    const folders = await getSubfolders(new Types.ObjectId(parentId));
    res.status(200).json(folders);
  } catch (err) {
    console.error("Get subfolders error:", err);
    res.status(500).json({ error: "Failed to fetch subfolders", detail: (err as Error).message });
  }
});

// Soft delete folder (and cascade)
export const DeleteFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const folder = await getFolderById(id);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.isDeleted) {
      return res.status(400).json({ message: "Folder already deleted" });
    }

    const deleted = await cascadeDeleteFolder(id);
    res.status(200).json(deleted);
  } catch (err) {
    console.error("Soft delete folder error:", err);
    res.status(500).json({ error: "Failed to delete folder", detail: (err as Error).message });
  }
});

// Rename a folder
export const renameFolderController = asyncHandler(async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const folder = await getFolderById(id);
    if (!folder || folder.isDeleted) {
      return res.status(404).json({ message: "Folder not found or is deleted" });
    }

    const updated = await renameFolder(id, name);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Rename folder error:", err);
    res.status(500).json({ error: "Failed to rename folder", detail: (err as Error).message });
  }
});


export const toggleFolderStarred = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { folderId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const folder = await getFolderById(folderId);

    if (!folder || folder.isDeleted || folder.owner.toString() !== userId) {
      return res
        .status(404)
        .json({ message: "Folder not found or already deleted" });
    }

    const toggledStarred = !folder.starred;
    const updatedFolder = await updateFolderStarredStatus(
      folderId,
      toggledStarred,
      userId
    );

    return res.status(200).json({
      message: `Folder successfully ${toggledStarred ? "starred" : "unstarred"}`,
      folder: updatedFolder,
    });
  }
);
