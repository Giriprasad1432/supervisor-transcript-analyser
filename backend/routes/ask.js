import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

// PHASE 1: Focuses on raw facts and KPI mapping
const PROMPT_PHASE_1 = `
You are an Evidence Extractor for DeepThought. 
Pull data from the transcript.

RULES:
1. Extract 3-5 quotes showing behavior.
2. Map to KPIs: Lead Gen, Lead Conv, Upselling, Cross-selling, NPS, PAT, TAT, Quality.
3. Mark if it's a "Personal Task" (Layer 1) or a "System" (Layer 2).

SCHEMA:
{
  "evidence": [{ "quote": "string", "signal": "positive|neutral|negative", "dimension": "execution|systems_building|kpi_impact|change_management", "interpretation": "string" }],
  "kpiMapping": [{ "kpi": "string", "evidence": "string", "systemOrPersonal": "system|personal" }]
}
`;

// PHASE 2: Focuses on the diagnostic score and gaps
const PROMPT_PHASE_2 = `
You are the Lead Critic. Use the transcript and the evidence to give a final score.

CRITICAL RULES:
- SCORE 6 is the ceiling for Layer 1 work (helping/firefighting).
- SCORE 7+ requires Layer 2 work (building lasting systems).
- Watch out for "Helpfulness Bias."

SCHEMA:
{
  "score": { "value": number, "label": "string", "band": "Need Attention|Productivity|Performance", "justification": "paragraph", "confidence": "low|medium|high" },
  "gaps": [{ "dimension": "string", "detail": "string" }],
  "followUpQuestions": [{ "question": "string", "targetGap": "string", "lookingFor": "string" }]
}
`;

const router = express.Router();

router.post("/", async (req, res) => {

  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({
      error: "No transcript provided."
    });
  }

  const userPrompt = `
Analyse this transcript and return the structured JSON analysis.

Transcript:
${transcript}
`;

  let attempts = 3;

  while (attempts > 0) {

    try {

      const result = await callOllama(
        userPrompt,
        SYSTEM_PROMPT
      );

      console.log("Raw Ollama response received.");

      let parsed;

      try {

        parsed = JSON.parse(result);

      } catch (e) {

        console.warn(
          "JSON Parse failed, retrying...",
          e.message
        );

        attempts--;
        continue;
      }

      if (!isValidJson(parsed)) {

        console.warn(
          "JSON Validation failed, retrying..."
        );

        attempts--;
        continue;
      }

      return res.json(parsed);

    } catch (err) {

      if (
        err.code === "ECONNREFUSED" ||
        err.message?.includes("fetch failed")
      ) {

        return res.status(503).json({
          error: "Ollama isn't running. Make sure it's open!"
        });
      }

      console.error("Ollama error:", err.message);

      attempts--;
    }
  }

  res.status(500).json({
    error:
      "Failed to generate a valid analysis after multiple attempts."
  });

});

export default router;