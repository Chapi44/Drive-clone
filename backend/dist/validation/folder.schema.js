"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameSchema = exports.createFolderSchema = void 0;
const zod_1 = require("zod");
// Schema for creating a folder
exports.createFolderSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Folder name is required"),
    parentFolder: zod_1.z.string().optional(), // Optional folder ID
});
// Schema for renaming a folder
exports.renameSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "New folder name is required"),
});
