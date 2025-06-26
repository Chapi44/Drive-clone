import { Router } from "express";
import {
  uploadFiles,       // multiple files upload controller
  getUserFiles,
  getFilesInFolder,
  DeleteFile,
  renameFileController,
  toggleFileStarred,
  getUserItems,
  getDeletedUserItems,
  deleteItemPermanentlyController,
  createItem,
  getFolderTree,
} from "../../controller/file.controller";

import { uploadMultipleFiles } from "../../middlewares/upload.middleware"; // multer middleware for multiple files
import { authenticate } from "../../middlewares/auth.middleware"; // your auth middleware

const router = Router();

// Upload multiple files (authenticated)
router.post(
  "/upload",
  authenticate,            // your auth middleware to protect route
  uploadMultipleFiles,     // multer middleware to parse multipart files
  createItem              // controller that saves file data in DB
);

// Get user files with pagination and optional filters
router.get("/user", authenticate, getUserFiles);

// Get files inside a folder
router.get("/folder/:folderId", authenticate, getFilesInFolder);

// Soft delete a file by id
router.delete("/delete/:id", authenticate, DeleteFile);

// Rename a file by id
router.patch("/:id/rename", authenticate, renameFileController);

router.patch("/:fileId/starred", authenticate, toggleFileStarred);

router.get("/items", authenticate, getUserItems);

// 🔹 Get all deleted items for user (files + folders)
router.get("/items/deleted", authenticate, getDeletedUserItems);

// 🔹 Permanently delete an item (file/folder)
router.delete("/items/permanent", authenticate, deleteItemPermanentlyController);

router.get("/folders/tree/:parentId?", authenticate, getFolderTree);



export default router;
