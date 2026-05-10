import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { env } from "../config/env";
import { HttpError } from "../utils/httpError";

const uploadsDir = path.resolve(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
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
