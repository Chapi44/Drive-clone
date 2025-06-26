import { IFile } from "./file";
import { IFolder } from "./folder";

export type Item = (IFile | IFolder) & { itemType: "file" | "folder" };
