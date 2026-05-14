import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

const router = express.Router();

const SYSTEM_PROMPT = `
You are an expert recruitment analyzer. Your task is to analyze interview transcripts and return a strictly formatted JSON object.

RULES:
1. Output ONLY valid JSON. No conversational text.
2. The JSON must follow this exact schema:
   {
     "evidence": [{"quote": "string", "sentiment": "positive|neutral|negative"}],
     "score": number, (1-10)
     "justification": "string",
     "gaps": ["string"],
     "follow_up_questions": ["string"]
   }
3. IMPORTANT: The number of items in "gaps" MUST exactly match the number of items in "follow_up_questions".
4. If no information is found, return empty arrays, not null.
`;

router.post("/", async (req, res) => {
  const { transcript } = req.body;
  
  if (!transcript) {
    return res.status(400).json({ error: "No transcript provided." });
  }

  let attempts = 3;

  while (attempts > 0) {
    try {
      const result = await callOllama(transcript, SYSTEM_PROMPT);
      console.log("Raw Ollama response received.");

      let parsed;
      try {
        parsed = JSON.parse(result);
      } catch (e) {
        console.warn("JSON Parse failed, retrying...", e.message);
        attempts--;
        continue;
      }

      if (!isValidJson(parsed)) {
        console.warn("JSON Validation failed, retrying...");
        attempts--;
        continue;
      }

      return res.json(parsed);

    } catch (err) {
      if (err.code === "ECONNREFUSED" || err.message?.includes("fetch failed")) {
        return res.status(503).json({
          error: "Ollama isn't running. Make sure it's open!"
        });
      }

      console.error("Ollama error:", err.message);
      attempts--;
    }
  }

  res.status(500).json({
    error: "Failed to generate a valid analysis after multiple attempts. Please try again."
  });
});

export default router;