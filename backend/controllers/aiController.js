const { analyzeWithOllama } = require("../services/ollamaService");

const fallbackAnalyze = (logs) => {
  const lower = logs.toLowerCase();
  const anomalies = [];
  if (lower.includes("error")) anomalies.push("Multiple error entries detected.");
  if (lower.includes("timeout")) anomalies.push("Timeout pattern observed in service communication.");
  if (lower.includes("high cpu")) anomalies.push("High CPU indicator found in logs.");

  return {
    summary: "Fallback analysis returned because Ollama is unavailable.",
    anomalies: anomalies.length ? anomalies : ["No explicit anomalies found in fallback mode."],
    optimizations: [
      "Enable structured logging for faster root-cause analysis.",
      "Set autoscaling alerts for CPU and memory hot spots.",
      "Introduce retry with backoff for timeout-heavy services."
    ]
  };
};

const analyzeLogs = async (req, res, next) => {
  try {
    const { logs } = req.body;
    if (!logs || typeof logs !== "string") {
      return res.status(400).json({ message: "A logs string is required." });
    }

    try {
      const modelResponse = await analyzeWithOllama(logs);
      return res.json({
        summary: modelResponse,
        anomalies: ["Review summary for model-identified anomalies."],
        optimizations: ["Review summary for optimization opportunities."]
      });
    } catch (ollamaError) {
      return res.json(fallbackAnalyze(logs));
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = { analyzeLogs };
