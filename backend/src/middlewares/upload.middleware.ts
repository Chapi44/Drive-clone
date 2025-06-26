import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

// File filter to allow only specified file types with try-catch
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  try {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      throw new Error("Only image, PDF, and video files are allowed");
    }
  } catch (error) {
    cb(error);
  }
};

// Export middleware for single file upload (field name configurable)
export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB (increase if necessary)
}).single("file");

// Optional: middleware for multiple files upload, e.g. profile pictures array
export const uploadMultipleFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).array("files", 5); // max 5 files at once
