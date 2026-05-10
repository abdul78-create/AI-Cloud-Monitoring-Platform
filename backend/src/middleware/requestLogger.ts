import { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const started = process.hrtime.bigint();

  res.on("finish", () => {
    const finished = process.hrtime.bigint();
    const durationMs = Number(finished - started) / 1_000_000;
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(2)}ms`);
  });

  next();
};
