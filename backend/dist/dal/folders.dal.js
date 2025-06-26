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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFolderStarredStatus = exports.cascadeDeleteFolder = exports.renameFolder = exports.deleteFolderById = exports.getFolderById = exports.getSubfolders = exports.createFolder = void 0;
exports.getFoldersByUser = getFoldersByUser;
const folder_model_1 = __importDefault(require("../models/folder.model"));
const mongoose_1 = require("mongoose");
// Create a folder
const createFolder = (folderData) => __awaiter(void 0, void 0, void 0, function* () {
    const folder = new folder_model_1.default(folderData);
    return yield folder.save();
});
exports.createFolder = createFolder;
// Get folders by user (excluding soft-deleted)
function getFoldersByUser(ownerId_1) {
    return __awaiter(this, arguments, void 0, function* (ownerId, page = 1, limit = 10, options) {
        const skip = (page - 1) * limit;
        const filter = { owner: ownerId, isDeleted: false };
        if (typeof (options === null || options === void 0 ? void 0 : options.starred) === "boolean") {
            filter.starred = options.starred;
        }
        if (options === null || options === void 0 ? void 0 : options.recentDays) {
            const recentDate = new Date();
            recentDate.setDate(recentDate.getDate() - options.recentDays);
            filter.updatedAt = { $gte: recentDate };
        }
        const data = yield folder_model_1.default.find(filter)
            .sort({ updatedAt: -1 }) // recent first
            .skip(skip)
            .limit(limit)
            .exec();
        const total = yield folder_model_1.default.countDocuments(filter);
        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    });
}
// Get subfolders by parent folder (excluding soft-deleted)
const getSubfolders = (parentFolderId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield folder_model_1.default.find({ parentFolder: parentFolderId, isDeleted: false });
});
exports.getSubfolders = getSubfolders;
// Get folder by ID (excluding soft-deleted)
const getFolderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield folder_model_1.default.findOne({ _id: id, isDeleted: false });
});
exports.getFolderById = getFolderById;
// Soft delete a folder
const deleteFolderById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield folder_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
});
exports.deleteFolderById = deleteFolderById;
// Rename folder
const renameFolder = (id, newName) => __awaiter(void 0, void 0, void 0, function* () {
    return yield folder_model_1.default.findByIdAndUpdate(id, { name: newName }, { new: true });
});
exports.renameFolder = renameFolder;
// Recursive soft delete
const cascadeDeleteFolder = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const root = yield (0, exports.deleteFolderById)(id);
    if (!root || !(root._id instanceof mongoose_1.Types.ObjectId))
        return null;
    const recurse = (parentId) => __awaiter(void 0, void 0, void 0, function* () {
        const children = yield folder_model_1.default.find({
            parentFolder: parentId,
            isDeleted: false
        });
        for (const child of children) {
            const childId = child._id;
            yield (0, exports.deleteFolderById)(childId.toString());
            yield recurse(childId);
        }
    });
    yield recurse(root._id);
    return root;
});
exports.cascadeDeleteFolder = cascadeDeleteFolder;
const updateFolderStarredStatus = (folderId, starred, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield folder_model_1.default.findOneAndUpdate({ _id: folderId, isDeleted: false, owner: userId }, { starred }, { new: true });
});
exports.updateFolderStarredStatus = updateFolderStarredStatus;
