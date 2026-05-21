import { Router } from "express";
import { aiController } from "../controllers/aiController";
import { logAnalyzerController } from "../controllers/logAnalyzerController";
import { validateAnalyzePayload } from "../middleware/validationMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const aiRoutes = Router();

// Legacy text-based analyze
aiRoutes.post("/ai/analyze", validateAnalyzePayload, asyncHandler(aiController.analyzeLogs));

// Production-grade log file upload analyzer
aiRoutes.post("/analyze", logAnalyzerController.uploadFile, asyncHandler(logAnalyzerController.analyzeLogs));
