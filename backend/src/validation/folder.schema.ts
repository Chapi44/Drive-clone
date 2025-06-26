import { z } from "zod";

// Schema for creating a folder
export const createFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  parentFolder: z.string().optional(), // Optional folder ID
});

// Schema for renaming a folder
export const renameSchema = z.object({
  name: z.string().min(1, "New folder name is required"),
});
