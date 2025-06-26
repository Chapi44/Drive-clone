"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const folder_controller_1 = require("../../controller/folder.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validateRequest_1 = require("../../middlewares/validateRequest");
const folder_schema_1 = require("../../validation/folder.schema");
const router = (0, express_1.Router)();
// Create a folder
router.post("/create", auth_middleware_1.authenticate, (0, validateRequest_1.validateRequest)(folder_schema_1.createFolderSchema), folder_controller_1.createNewFolder);
// Get user's root folders (with pagination, starred, recent filters)
router.get("/me", auth_middleware_1.authenticate, folder_controller_1.getUserFolders);
// Get subfolders by parent folder ID
router.get("/sub/:parentId", auth_middleware_1.authenticate, folder_controller_1.getSubFolders);
// Soft delete a folder
router.delete("/delete/:id", auth_middleware_1.authenticate, folder_controller_1.DeleteFolder);
// Rename a folder
router.patch("/rename/:id", auth_middleware_1.authenticate, (0, validateRequest_1.validateRequest)(folder_schema_1.renameSchema), folder_controller_1.renameFolderController);
router.patch("/:folderId/starred", auth_middleware_1.authenticate, folder_controller_1.toggleFolderStarred);
exports.default = router;
