import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

import { Request } from "express";

const uploadsDir = path.resolve(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => cb(null, uploadsDir),
  filename: (_req: any, file: any, cb: any) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (_req: any, file: any, cb: any) => {
  if (!/\.(txt|log)$/i.test(file.originalname)) {
    cb(new HttpError(400, "Only .txt and .log files are allowed."));
    return;
  }
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 }
});
