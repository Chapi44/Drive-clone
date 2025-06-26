"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultipleFiles = exports.uploadSingleFile = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadDir = path_1.default.join(__dirname, "..", "uploads");
// Ensure uploads directory exists
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Allowed mime types for files users can upload
const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "video/mp4", // Add support for video/mp4 MIME type
    "video/mpeg", // Add support for video/mpeg MIME type
    "video/quicktime", // Add support for video/quicktime MIME type
];
// Multer storage config: save files with timestamp to avoid collisions
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        const baseName = path_1.default.basename(file.originalname, ext).replace(/\s+/g, "_");
        cb(null, `${baseName}-${Date.now()}${ext}`);
    },
});
// File filter to allow only specified file types with try-catch
const fileFilter = (_req, file, cb) => {
    try {
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            throw new Error("Only image, PDF, and video files are allowed");
        }
    }
    catch (error) {
        cb(error);
    }
};
// Export middleware for single file upload (field name configurable)
exports.uploadSingleFile = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB (increase if necessary)
}).single("file");
// Optional: middleware for multiple files upload, e.g. profile pictures array
exports.uploadMultipleFiles = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 },
}).array("files", 5); // max 5 files at once
