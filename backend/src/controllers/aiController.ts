import { Request, Response } from "express";
import { ollamaService } from "../ai/ollamaService";

export const aiController = {
  async analyzeLogs(req: Request, res: Response): Promise<void> {
    const { logs } = req.body as { logs: string };
    const analysis = await ollamaService.analyzeLogs(logs);
    res.json({ success: true, data: analysis });
  }
};
