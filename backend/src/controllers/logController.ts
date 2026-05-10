import { Request, Response } from "express";
import { HttpError } from "../utils/httpError";
import { readUploadedLog } from "../services/logService";

export const logController = {
  async uploadLog(req: Request, res: Response): Promise<void> {
    if (!req.file) {
      throw new HttpError(400, "No file uploaded. Use field name 'logFile'.");
    }

    const content = await readUploadedLog(req.file.path);
    res.status(201).json({
      success: true,
      data: {
        fileName: req.file.originalname,
        size: req.file.size,
        content
      }
    });
  }
};
