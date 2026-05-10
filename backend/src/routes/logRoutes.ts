import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { logController } from "../controllers/logController";
import { uploadMiddleware } from "../middleware/uploadMiddleware";

export const logRoutes = Router();

logRoutes.post("/logs/upload", uploadMiddleware.single("logFile"), asyncHandler(logController.uploadLog));
logRoutes.post("/upload/logs", uploadMiddleware.single("logFile"), asyncHandler(logController.uploadLog));
