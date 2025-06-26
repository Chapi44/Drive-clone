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
exports.getSubfolders = exports.getItemsInFolder = exports.deleteItemPermanently = exports.getAllDeletedItemsByUser = exports.getAllItemsByUser = exports.updateFileStarredStatus = exports.renameFile = exports.deleteFileById = exports.getFileById = exports.getFilesByFolder = exports.createFilesBulk = exports.createFile = void 0;
exports.getFilesByUser = getFilesByUser;
const file_model_1 = __importDefault(require("../models/file.model"));
const folder_model_1 = __importDefault(require("../models/folder.model"));
// Create a file
const createFile = (fileData) => __awaiter(void 0, void 0, void 0, function* () {
    const file = new file_model_1.default(fileData);
    return yield file.save();
});
exports.createFile = createFile;
// Bulk create files
const createFilesBulk = (filesData) => __awaiter(void 0, void 0, void 0, function* () {
    return yield file_model_1.default.insertMany(filesData);
});
exports.createFilesBulk = createFilesBulk;
// Get all files by user (excluding soft-deleted)
function getFilesByUser(ownerId_1) {
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
        if ((options === null || options === void 0 ? void 0 : options.mimetypes) && options.mimetypes.length > 0) {
            filter.mimetype = { $in: options.mimetypes };
        }
        const files = yield file_model_1.default.find(filter)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const total = yield file_model_1.default.countDocuments(filter);
        return {
            data: files,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    });
}
// Get files by folder (excluding soft-deleted)
const getFilesByFolder = (folderId_1, ...args_1) => __awaiter(void 0, [folderId_1, ...args_1], void 0, function* (folderId, page = 1, limit = 10, options) {
    const skip = (page - 1) * limit;
    const filter = {
        parentFolder: folderId,
        isDeleted: false,
    };
    if (typeof (options === null || options === void 0 ? void 0 : options.starred) === "boolean") {
        filter.starred = options.starred;
    }
    if (options === null || options === void 0 ? void 0 : options.recentDays) {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - options.recentDays);
        filter.updatedAt = { $gte: recentDate };
    }
    if ((options === null || options === void 0 ? void 0 : options.mimetypes) && options.mimetypes.length > 0) {
        filter.mimetype = { $in: options.mimetypes };
    }
    const files = yield file_model_1.default.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    const total = yield file_model_1.default.countDocuments(filter);
    return {
        data: files,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
});
exports.getFilesByFolder = getFilesByFolder;
// Get file by ID (only if not soft-deleted)
const getFileById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield file_model_1.default.findOne({ _id: id, isDeleted: false });
});
exports.getFileById = getFileById;
// Soft delete a file
const deleteFileById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield file_model_1.default.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { new: true });
});
exports.deleteFileById = deleteFileById;
// Rename file
const renameFile = (id, newName) => __awaiter(void 0, void 0, void 0, function* () {
    return yield file_model_1.default.findByIdAndUpdate(id, { name: newName }, { new: true });
});
exports.renameFile = renameFile;
const updateFileStarredStatus = (fileId, starred) => __awaiter(void 0, void 0, void 0, function* () {
    return yield file_model_1.default.findOneAndUpdate({ _id: fileId, isDeleted: false }, { starred }, { new: true });
});
exports.updateFileStarredStatus = updateFileStarredStatus;
const getAllItemsByUser = (ownerId_1, ...args_1) => __awaiter(void 0, [ownerId_1, ...args_1], void 0, function* (ownerId, page = 1, limit = Number.MAX_SAFE_INTEGER, options) {
    var _a;
    const skip = (page - 1) * limit;
    const folderFilter = { owner: ownerId, isDeleted: false };
    const fileFilter = { owner: ownerId, isDeleted: false };
    if (typeof (options === null || options === void 0 ? void 0 : options.starred) === "boolean") {
        folderFilter.starred = options.starred;
        fileFilter.starred = options.starred;
    }
    if (options === null || options === void 0 ? void 0 : options.recentDays) {
        const since = new Date();
        since.setDate(since.getDate() - options.recentDays);
        folderFilter.createdAt = { $gte: since };
        fileFilter.createdAt = { $gte: since };
    }
    if ((_a = options === null || options === void 0 ? void 0 : options.mimetypes) === null || _a === void 0 ? void 0 : _a.length) {
        fileFilter.mimetype = { $in: options.mimetypes };
    }
    if (options === null || options === void 0 ? void 0 : options.searchKey) {
        const nameRegex = new RegExp(options.searchKey, "i");
        folderFilter.name = { $regex: nameRegex };
        fileFilter.name = { $regex: nameRegex };
    }
    const [folders, files] = yield Promise.all([
        folder_model_1.default.find(folderFilter).lean(),
        file_model_1.default.find(fileFilter).lean(),
    ]);
    const foldersWithType = folders.map((f) => (Object.assign(Object.assign({}, f), { itemType: "folder" })));
    const filesWithType = files.map((f) => (Object.assign(Object.assign({}, f), { itemType: "file" })));
    let combined = [];
    if ((options === null || options === void 0 ? void 0 : options.itemType) === "folder") {
        combined = foldersWithType;
    }
    else if ((options === null || options === void 0 ? void 0 : options.itemType) === "file") {
        combined = filesWithType;
    }
    else {
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
});
exports.getAllItemsByUser = getAllItemsByUser;
const getAllDeletedItemsByUser = (ownerId_1, ...args_1) => __awaiter(void 0, [ownerId_1, ...args_1], void 0, function* (ownerId, page = 1, limit = Number.MAX_SAFE_INTEGER, options) {
    var _a;
    const skip = (page - 1) * limit;
    const folderFilter = { owner: ownerId, isDeleted: true };
    const fileFilter = { owner: ownerId, isDeleted: true };
    if (typeof (options === null || options === void 0 ? void 0 : options.starred) === "boolean") {
        folderFilter.starred = options.starred;
        fileFilter.starred = options.starred;
    }
    if (options === null || options === void 0 ? void 0 : options.recentDays) {
        const since = new Date();
        since.setDate(since.getDate() - options.recentDays);
        folderFilter.createdAt = { $gte: since };
        fileFilter.createdAt = { $gte: since };
    }
    if ((_a = options === null || options === void 0 ? void 0 : options.mimetypes) === null || _a === void 0 ? void 0 : _a.length) {
        fileFilter.mimetype = { $in: options.mimetypes };
    }
    if (options === null || options === void 0 ? void 0 : options.searchKey) {
        const nameRegex = new RegExp(options.searchKey, "i");
        folderFilter.name = { $regex: nameRegex };
        fileFilter.name = { $regex: nameRegex };
    }
    const [folders, files] = yield Promise.all([
        folder_model_1.default.find(folderFilter).lean(),
        file_model_1.default.find(fileFilter).lean(),
    ]);
    const foldersWithType = folders.map((f) => (Object.assign(Object.assign({}, f), { itemType: "folder" })));
    const filesWithType = files.map((f) => (Object.assign(Object.assign({}, f), { itemType: "file" })));
    let combined = [];
    if ((options === null || options === void 0 ? void 0 : options.itemType) === "folder") {
        combined = foldersWithType;
    }
    else if ((options === null || options === void 0 ? void 0 : options.itemType) === "file") {
        combined = filesWithType;
    }
    else {
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
});
exports.getAllDeletedItemsByUser = getAllDeletedItemsByUser;
const deleteItemPermanently = (id, itemType) => __awaiter(void 0, void 0, void 0, function* () {
    if (itemType === "file") {
        return yield file_model_1.default.findOneAndDelete({ _id: id, isDeleted: true });
    }
    else {
        return yield folder_model_1.default.findOneAndDelete({ _id: id, isDeleted: true });
    }
});
exports.deleteItemPermanently = deleteItemPermanently;
const getItemsInFolder = (parentFolderId_1, ...args_1) => __awaiter(void 0, [parentFolderId_1, ...args_1], void 0, function* (parentFolderId, page = 1, limit = Number.MAX_SAFE_INTEGER, options) {
    var _a;
    const skip = (page - 1) * limit;
    const folderFilter = { parentFolder: parentFolderId, isDeleted: false };
    const fileFilter = { parentFolder: parentFolderId, isDeleted: false };
    if (typeof (options === null || options === void 0 ? void 0 : options.starred) === "boolean") {
        folderFilter.starred = options.starred;
        fileFilter.starred = options.starred;
    }
    if (options === null || options === void 0 ? void 0 : options.recentDays) {
        const since = new Date();
        since.setDate(since.getDate() - options.recentDays);
        folderFilter.createdAt = { $gte: since };
        fileFilter.createdAt = { $gte: since };
    }
    if ((_a = options === null || options === void 0 ? void 0 : options.mimetypes) === null || _a === void 0 ? void 0 : _a.length) {
        fileFilter.mimetype = { $in: options.mimetypes };
    }
    if (options === null || options === void 0 ? void 0 : options.searchKey) {
        const regex = new RegExp(options.searchKey, "i");
        folderFilter.name = { $regex: regex };
        fileFilter.name = { $regex: regex };
    }
    const [folders, files] = yield Promise.all([
        folder_model_1.default.find(folderFilter).lean(),
        file_model_1.default.find(fileFilter).lean(),
    ]);
    const foldersWithType = folders.map((f) => (Object.assign(Object.assign({}, f), { itemType: "folder" })));
    const filesWithType = files.map((f) => (Object.assign(Object.assign({}, f), { itemType: "file" })));
    let combined = [];
    if ((options === null || options === void 0 ? void 0 : options.itemType) === "folder") {
        combined = foldersWithType;
    }
    else if ((options === null || options === void 0 ? void 0 : options.itemType) === "file") {
        combined = filesWithType;
    }
    else {
        combined = [...foldersWithType, ...filesWithType];
    }
    combined.sort((a, b) => {
        if (a.itemType !== b.itemType)
            return a.itemType === "folder" ? -1 : 1;
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
});
exports.getItemsInFolder = getItemsInFolder;
const getSubfolders = (parentFolderId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield folder_model_1.default.find({ parentFolder: parentFolderId, isDeleted: false }).lean();
});
exports.getSubfolders = getSubfolders;
