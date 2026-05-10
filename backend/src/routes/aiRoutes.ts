import { Router } from "express";
import { aiController } from "../controllers/aiController";
import { validateAnalyzePayload } from "../middleware/validationMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

export const aiRoutes = Router();

aiRoutes.post("/ai/analyze", validateAnalyzePayload, asyncHandler(aiController.analyzeLogs));
