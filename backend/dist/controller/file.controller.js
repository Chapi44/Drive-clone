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
exports.getFolderTree = exports.createItem = exports.deleteItemPermanentlyController = exports.getDeletedUserItems = exports.getUserItems = exports.toggleFileStarred = exports.renameFileController = exports.DeleteFile = exports.getFilesInFolder = exports.getUserFiles = exports.uploadFiles = void 0;
const mongoose_1 = require("mongoose");
const files_dal_1 = require("../dal/files.dal");
const folders_dal_1 = require("../dal/folders.dal");
const asyncHandler_1 = require("../utils/asyncHandler");
// Upload Files with internal try-catch
exports.uploadFiles = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId || !req.files) {
            return res.status(400).json({ error: "Files and authentication required" });
        }
        const files = req.files;
        const { parentFolder } = req.body;
        const baseURL = process.env.BASE_URL || "http://localhost:4500";
        if (parentFolder) {
            const parent = yield (0, folders_dal_1.getFolderById)(parentFolder);
            if (!parent) {
                return res.status(404).json({ error: "Parent folder not found or is deleted" });
            }
        }
        const fileDocs = files.map((file) => ({
            name: file.originalname,
            size: file.size,
            url: `${baseURL}/uploads/${file.filename}`,
            owner: new mongoose_1.Types.ObjectId(userId),
            parentFolder: parentFolder ? new mongoose_1.Types.ObjectId(parentFolder) : undefined,
            mimetype: file.mimetype,
        }));
        const createdFiles = yield (0, files_dal_1.createFilesBulk)(fileDocs);
        res.status(201).json(createdFiles);
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ error: "File upload failed", detail: err.message });
    }
}));
// List user files with filters
exports.getUserFiles = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const starred = req.query.starred === "true"
            ? true
            : req.query.starred === "false"
                ? false
                : undefined;
        const recentDays = req.query.recentDays
            ? parseInt(req.query.recentDays)
            : undefined;
        const mimetypes = req.query.mimetypes
            ? Array.isArray(req.query.mimetypes)
                ? req.query.mimetypes.map((m) => typeof m === "string" ? m : String(m)).filter((m) => typeof m === "string")
                : [typeof req.query.mimetypes === "string" ? req.query.mimetypes : String(req.query.mimetypes)]
            : undefined;
        const result = yield (0, files_dal_1.getFilesByUser)(new mongoose_1.Types.ObjectId(userId), page, limit, { starred, recentDays, mimetypes });
        return res.status(200).json(result);
    }
    catch (err) {
        console.error("Get user files error:", err);
        res.status(500).json({ error: "Failed to fetch files", detail: err.message });
    }
}));
// Get files in a folder
exports.getFilesInFolder = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { folderId } = req.params;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : Number.MAX_SAFE_INTEGER;
        const starred = req.query.starred === "true"
            ? true
            : req.query.starred === "false"
                ? false
                : undefined;
        const recentDays = req.query.recentDays
            ? parseInt(req.query.recentDays)
            : undefined;
        const mimetypes = req.query.mimetypes
            ? Array.isArray(req.query.mimetypes)
                ? req.query.mimetypes.map((m) => typeof m === "string" ? m : String(m)).filter((m) => typeof m === "string")
                : [String(req.query.mimetypes)]
            : undefined;
        const itemType = req.query.itemType === "file" || req.query.itemType === "folder"
            ? req.query.itemType
            : undefined;
        const searchKey = typeof req.query.searchKey === "string" ? req.query.searchKey : undefined;
        const result = yield (0, files_dal_1.getItemsInFolder)(new mongoose_1.Types.ObjectId(folderId), page, limit, { starred, recentDays, mimetypes, itemType, searchKey });
        return res.status(200).json(result);
    }
    catch (err) {
        console.error("Get folder items error:", err);
        res.status(500).json({ error: "Failed to fetch folder contents", detail: err.message });
    }
}));
// Soft delete a file
exports.DeleteFile = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const file = yield (0, files_dal_1.getFileById)(id);
        if (!file) {
            return res.status(404).json({ message: "File not found or already deleted" });
        }
        const deleted = yield (0, files_dal_1.deleteFileById)(id);
        res.status(200).json(deleted);
    }
    catch (err) {
        console.error("Soft delete error:", err);
        res.status(500).json({ error: "Failed to delete file", detail: err.message });
    }
}));
// Rename a file
exports.renameFileController = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const file = yield (0, files_dal_1.getFileById)(id);
        if (!file) {
            return res.status(404).json({ message: "File not found or is deleted" });
        }
        const updated = yield (0, files_dal_1.renameFile)(id, name);
        res.status(200).json(updated);
    }
    catch (err) {
        console.error("Rename error:", err);
        res.status(500).json({ error: "Failed to rename file", detail: err.message });
    }
}));
exports.toggleFileStarred = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { fileId } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const file = yield (0, files_dal_1.getFileById)(fileId);
    if (!file || file.isDeleted || file.owner.toString() !== userId) {
        return res.status(404).json({ message: "File not found or already deleted" });
    }
    const toggledStarred = !file.starred;
    const updatedFile = yield (0, files_dal_1.updateFileStarredStatus)(fileId, toggledStarred);
    return res.status(200).json({
        message: `File successfully ${toggledStarred ? "starred" : "unstarred"}`,
        file: updatedFile,
    });
}));
exports.getUserItems = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : Number.MAX_SAFE_INTEGER;
        const starred = req.query.starred === "true"
            ? true
            : req.query.starred === "false"
                ? false
                : undefined;
        const recentDays = req.query.recentDays
            ? parseInt(req.query.recentDays)
            : undefined;
        const mimetypes = req.query.mimetypes
            ? Array.isArray(req.query.mimetypes)
                ? req.query.mimetypes.map((m) => typeof m === "string" ? m : String(m)).filter((m) => typeof m === "string")
                : [typeof req.query.mimetypes === "string" ? req.query.mimetypes : String(req.query.mimetypes)]
            : undefined;
        const itemType = req.query.itemType === "file" || req.query.itemType === "folder"
            ? req.query.itemType
            : undefined;
        const searchKey = req.query.searchKey ? String(req.query.searchKey) : undefined;
        const result = yield (0, files_dal_1.getAllItemsByUser)(new mongoose_1.Types.ObjectId(userId), page, limit, { starred, recentDays, mimetypes, itemType, searchKey });
        return res.status(200).json(result);
    }
    catch (err) {
        console.error("Get user items error:", err);
        res.status(500).json({ error: "Failed to fetch user items", detail: err.message });
    }
}));
exports.getDeletedUserItems = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const limit = req.query.limit ? parseInt(req.query.limit) : Number.MAX_SAFE_INTEGER;
        const starred = req.query.starred === "true"
            ? true
            : req.query.starred === "false"
                ? false
                : undefined;
        const recentDays = req.query.recentDays
            ? parseInt(req.query.recentDays)
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
        const result = yield (0, files_dal_1.getAllDeletedItemsByUser)(new mongoose_1.Types.ObjectId(userId), page, limit, { starred, recentDays, mimetypes, itemType, searchKey });
        res.status(200).json(result);
    }
    catch (err) {
        console.error("Get deleted user items error:", err);
        res.status(500).json({ error: "Failed to fetch deleted items", detail: err.message });
    }
}));
exports.deleteItemPermanentlyController = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, itemType } = req.body;
        if (!id || (itemType !== "file" && itemType !== "folder")) {
            return res.status(400).json({ message: "Invalid request. 'id' and 'itemType' are required." });
        }
        const deleted = yield (0, files_dal_1.deleteItemPermanently)(id, itemType);
        if (!deleted) {
            return res.status(404).json({ message: "Item not found or not deleted previously." });
        }
        res.status(200).json({ message: "Item permanently deleted", item: deleted });
    }
    catch (err) {
        console.error("Permanent delete error:", err);
        res.status(500).json({ error: "Failed to permanently delete item", detail: err.message });
    }
}));
exports.createItem = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const { itemType, parentFolder } = req.body;
    if (!itemType || (itemType !== "file" && itemType !== "folder")) {
        return res.status(400).json({ message: "Invalid or missing itemType" });
    }
    // Validate parent folder (optional)
    let parent = null;
    if (parentFolder) {
        parent = yield (0, folders_dal_1.getFolderById)(parentFolder);
        if (!parent) {
            return res.status(404).json({ message: "Parent folder not found or deleted" });
        }
    }
    if (itemType === "folder") {
        const { name } = req.body;
        if (!name)
            return res.status(400).json({ message: "Name is required for folders" });
        const folderData = {
            name,
            owner: new mongoose_1.Types.ObjectId(userId),
            parentFolder: parent ? parent._id : undefined,
        };
        const createdFolder = yield (0, folders_dal_1.createFolder)(folderData);
        return res.status(201).json({ item: createdFolder, itemType: "folder" });
    }
    if (itemType === "file") {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "Files are required" });
        }
        const baseURL = process.env.BASE_URL || "http://localhost:4500";
        const fileDocs = files.map((file) => ({
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            url: `${baseURL}/uploads/${file.filename}`,
            owner: new mongoose_1.Types.ObjectId(userId),
            parentFolder: parent ? parent._id : undefined,
        }));
        const createdFiles = yield (0, files_dal_1.createFilesBulk)(fileDocs);
        return res.status(201).json({ items: createdFiles, itemType: "file" });
    }
}));
exports.getFolderTree = (0, asyncHandler_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { parentId } = req.params;
        const parentFolderId = parentId ? new mongoose_1.Types.ObjectId(parentId) : null;
        // Recursive function using DAL only
        const buildTree = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
            const children = yield (0, files_dal_1.getSubfolders)(parentId || new mongoose_1.Types.ObjectId());
            const tree = yield Promise.all(children.map((folder) => __awaiter(void 0, void 0, void 0, function* () {
                const subTree = yield buildTree(folder._id);
                return Object.assign(Object.assign({}, folder), { itemType: "folder", children: subTree });
            })));
            return tree;
        });
        const tree = yield buildTree(parentFolderId);
        return res.status(200).json(tree);
    }
    catch (err) {
        console.error("Folder tree fetch error:", err);
        res.status(500).json({ error: "Failed to fetch folder tree", detail: err.message });
    }
}));
