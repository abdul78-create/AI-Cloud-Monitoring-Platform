import { promises as fs } from "node:fs";
import path from "node:path";
import { HttpError } from "../utils/httpError";

export const readUploadedLog = async (filePath: string): Promise<string> => {
  const resolved = path.resolve(filePath);
  const content = await fs.readFile(resolved, "utf-8");
  if (!content.trim()) {
    throw new HttpError(400, "Uploaded file is empty.");
  }
  return content;
};
