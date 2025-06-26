import { Router } from "express";
import {
  createNewFolder,
  getUserFolders,
  getSubFolders,
  DeleteFolder,
  renameFolderController,
  toggleFolderStarred,
} from "../../controller/folder.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validateRequest";
import { createFolderSchema, renameSchema } from "../../validation/folder.schema";

const router = Router();

// Create a folder
router.post("/create", authenticate, validateRequest(createFolderSchema), createNewFolder);

// Get user's root folders (with pagination, starred, recent filters)
router.get("/me", authenticate, getUserFolders);

// Get subfolders by parent folder ID
router.get("/sub/:parentId", authenticate, getSubFolders);

// Soft delete a folder
router.delete("/delete/:id", authenticate, DeleteFolder);

// Rename a folder
router.patch("/rename/:id", authenticate, validateRequest(renameSchema), renameFolderController);


router.patch("/:folderId/starred", authenticate, toggleFolderStarred);

export default router;
