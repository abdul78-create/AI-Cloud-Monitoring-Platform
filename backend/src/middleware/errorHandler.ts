import { NextFunction, Request, Response } from "express";
import { HttpError } from "../utils/httpError";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error.message || "Internal server error";

  res.status(statusCode).json({
    success: false,
    message
  });
};
