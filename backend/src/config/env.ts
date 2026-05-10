import dotenv from "dotenv";

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 5000),
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL ?? "llama3",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  maxUploadSizeMb: toNumber(process.env.MAX_UPLOAD_SIZE_MB, 2),
  demoAiMode: String(process.env.DEMO_AI_MODE ?? "false").toLowerCase() === "true",
  ollamaTimeoutMs: toNumber(process.env.OLLAMA_TIMEOUT_MS, 30000),
  nodeEnv: process.env.NODE_ENV ?? "development"
};
