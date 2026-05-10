import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export const validateAnalyzePayload = (req: Request, _res: Response, next: NextFunction): void => {
  const logs = req.body?.logs;
  if (typeof logs !== "string" || logs.trim().length < 10) {
    next(new HttpError(400, "Invalid payload. 'logs' must be a non-empty string."));
    return;
  }
  next();
};
