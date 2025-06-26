"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFolderStarred = exports.renameFolderController = exports.DeleteFolder = exports.getSubFolders = exports.getUserFolders = exports.createNewFolder = void 0;
const mongoose_1 = require("mongoose");
const folders_dal_1 = require("../dal/folders.dal");
const asyncHandler_1 = require("../utils/asyncHandler");
// Create a new folder
exports.createNewFolder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { name, parentFolder } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!name || !userId) {
            return res.status(400).json({ error: "Name and authentication required" });
        }
        if (parentFolder) {
            const existingParent = yield (0, folders_dal_1.getFolderById)(parentFolder);
            if (!existingParent || existingParent.isDeleted) {
                return res.status(404).json({ error: "Parent folder not found or is deleted" });
            }
        }
        const folder = yield (0, folders_dal_1.createFolder)({
            name,
            owner: new mongoose_1.Types.ObjectId(userId),
            parentFolder: parentFolder ? new mongoose_1.Types.ObjectId(parentFolder) : undefined,
        });
        res.status(201).json(folder);
    }
    catch (err) {
        console.error("Create folder error:", err);
        res.status(500).json({ error: "Failed to create folder", detail: err.message });
    }
}));
// Get all folders of a user
exports.getUserFolders = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const starred = req.query.starred === "true" ? true : req.query.starred === "false" ? false : undefined;
        const recentDays = req.query.recentDays ? parseInt(req.query.recentDays) : undefined;
        const result = yield (0, folders_dal_1.getFoldersByUser)(new mongoose_1.Types.ObjectId(userId), page, limit, { starred, recentDays });
        res.status(200).json(result);
    }
    catch (err) {
        console.error("Get user folders error:", err);
        res.status(500).json({ error: "Failed to fetch folders", detail: err.message });
    }
}));
// Get subfolders of a folder
exports.getSubFolders = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const parent = yield (0, folders_dal_1.getFolderById)(parentId);
        if (!parent || parent.isDeleted) {
            return res.status(404).json({ message: "Parent folder not found or is deleted" });
        }
        const folders = yield (0, folders_dal_1.getSubfolders)(new mongoose_1.Types.ObjectId(parentId));
        res.status(200).json(folders);
    }
    catch (err) {
        console.error("Get subfolders error:", err);
        res.status(500).json({ error: "Failed to fetch subfolders", detail: err.message });
    }
}));
// Soft delete folder (and cascade)
exports.DeleteFolder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const folder = yield (0, folders_dal_1.getFolderById)(id);
        if (!folder) {
            return res.status(404).json({ message: "Folder not found" });
        }
        if (folder.isDeleted) {
            return res.status(400).json({ message: "Folder already deleted" });
        }
        const deleted = yield (0, folders_dal_1.cascadeDeleteFolder)(id);
        res.status(200).json(deleted);
    }
    catch (err) {
        console.error("Soft delete folder error:", err);
        res.status(500).json({ error: "Failed to delete folder", detail: err.message });
    }
}));
// Rename a folder
exports.renameFolderController = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const folder = yield (0, folders_dal_1.getFolderById)(id);
        if (!folder || folder.isDeleted) {
            return res.status(404).json({ message: "Folder not found or is deleted" });
        }
        const updated = yield (0, folders_dal_1.renameFolder)(id, name);
        res.status(200).json(updated);
    }
    catch (err) {
        console.error("Rename folder error:", err);
        res.status(500).json({ error: "Failed to rename folder", detail: err.message });
    }
}));
exports.toggleFolderStarred = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { folderId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const folder = yield (0, folders_dal_1.getFolderById)(folderId);
    if (!folder || folder.isDeleted || folder.owner.toString() !== userId) {
        return res
            .status(404)
            .json({ message: "Folder not found or already deleted" });
    }
    const toggledStarred = !folder.starred;
    const updatedFolder = yield (0, folders_dal_1.updateFolderStarredStatus)(folderId, toggledStarred, userId);
    return res.status(200).json({
        message: `Folder successfully ${toggledStarred ? "starred" : "unstarred"}`,
        folder: updatedFolder,
    });
}));
