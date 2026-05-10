const { ollamaBaseUrl, ollamaModel } = require("../config/env");

const analyzeWithOllama = async (logs) => {
  const prompt = `
You are an SRE assistant. Analyze the following cloud infrastructure logs.
Return:
1) short summary
2) list of anomalies
3) list of optimization suggestions

Logs:
${logs}
`;

  const response = await fetch(`${ollamaBaseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      prompt,
      stream: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.response || "No response from model.";
};

module.exports = { analyzeWithOllama };
