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
    return res.status(400).json({ error: "No transcript provided." });
  }

  try {
    // Step 1: Fact Extraction
    console.log("Starting Phase 1...");
    const result1 = await callOllama(transcript, PROMPT_PHASE_1);
    const factData = JSON.parse(result1);

    // Step 2: Diagnostic Evaluation
    console.log("Starting Phase 2...");
    const phase2Input = `Transcript: ${transcript}\n\nEvidence: ${JSON.stringify(factData.evidence)}`;
    const result2 = await callOllama(phase2Input, PROMPT_PHASE_2);
    const diagnosticData = JSON.parse(result2);

    // Combine everything
    const finalAnalysis = {
      ...factData,
      ...diagnosticData
    };

    // Final sanity check
    if (!isValidJson(finalAnalysis)) {
      return res.status(500).json({ error: "Analysis failed validation check." });
    }

    return res.json(finalAnalysis);

  } catch (err) {
    console.error("Analysis Pipeline Error:", err.message);
    res.status(500).json({ 
      error: "Something went wrong during analysis. Please try again." 
    });
  }
});

export default router;