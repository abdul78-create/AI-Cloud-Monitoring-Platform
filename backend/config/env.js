const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  ollamaModel: process.env.OLLAMA_MODEL || "llama3"
};
