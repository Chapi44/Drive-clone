"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_controller_1 = require("../../controller/file.controller");
const upload_middleware_1 = require("../../middlewares/upload.middleware"); // multer middleware for multiple files
const auth_middleware_1 = require("../../middlewares/auth.middleware"); // your auth middleware
const router = (0, express_1.Router)();
// Upload multiple files (authenticated)
router.post("/upload", auth_middleware_1.authenticate, // your auth middleware to protect route
upload_middleware_1.uploadMultipleFiles, // multer middleware to parse multipart files
file_controller_1.createItem // controller that saves file data in DB
);
// Get user files with pagination and optional filters
router.get("/user", auth_middleware_1.authenticate, file_controller_1.getUserFiles);
// Get files inside a folder
router.get("/folder/:folderId", auth_middleware_1.authenticate, file_controller_1.getFilesInFolder);
// Soft delete a file by id
router.delete("/delete/:id", auth_middleware_1.authenticate, file_controller_1.DeleteFile);
// Rename a file by id
router.patch("/:id/rename", auth_middleware_1.authenticate, file_controller_1.renameFileController);
router.patch("/:fileId/starred", auth_middleware_1.authenticate, file_controller_1.toggleFileStarred);
router.get("/items", auth_middleware_1.authenticate, file_controller_1.getUserItems);
// 🔹 Get all deleted items for user (files + folders)
router.get("/items/deleted", auth_middleware_1.authenticate, file_controller_1.getDeletedUserItems);
// 🔹 Permanently delete an item (file/folder)
router.delete("/items/permanent", auth_middleware_1.authenticate, file_controller_1.deleteItemPermanentlyController);
router.get("/folders/tree/:parentId?", auth_middleware_1.authenticate, file_controller_1.getFolderTree);
exports.default = router;
