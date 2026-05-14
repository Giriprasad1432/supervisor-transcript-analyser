import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

const router = express.Router();

const prompt1 = `
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

const prompt2 = `
You are the Lead Critic for DeepThought. Your job is to be CYNICAL and strict.

THE 6 vs 7 BOUNDARY (Most Important):
- SCORE 6 (Productivity): "He is helpful. He does his work well. He maintains a sheet for me." -> This is TASK ABSORPTION.
- SCORE 7 (Performance): "He built a system that runs WITHOUT him. He identified a problem I didn't see."

THE SURVIVABILITY TEST:
If the Fellow leaves, does the work stop?
- "He sends me WhatsApp updates" -> Work stops when he leaves. (Score 5-6)
- "He created an SOP and trained the team to use it" -> Work continues. (Score 7-8)

CRITICAL CASE (The Karthik Case):
If a supervisor says "He is sincere, always on the floor, and maintains a sheet for me," do NOT give a 9. Give a 6. Maintaining a sheet is NOT a self-sustaining system.

SCHEMA:
{
  "score": { "value": number, "label": "string", "band": "Need Attention|Productivity|Performance", "justification": "One paragraph strictly applying the Survivability Test.", "confidence": "low|medium|high" },
  "gaps": [{ "dimension": "execution|systems_building|kpi_impact|change_management", "detail": "string" }],
  "followUpQuestions": [{ "question": "string", "targetGap": "string", "lookingFor": "string" }]
}
`;

router.post("/", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: "No transcript provided." });

  try {
    const result1 = await callOllama(transcript, prompt1);
    const factData = JSON.parse(result1);

    const input2 = `Transcript: ${transcript}\n\nEvidence: ${JSON.stringify(factData.evidence)}`;
    const result2 = await callOllama(input2, prompt2);
    const diagnosticData = JSON.parse(result2);

    const finalResult = {
      score: diagnosticData.score,
      evidence: factData.evidence,
      kpiMapping: factData.kpiMapping,
      gaps: diagnosticData.gaps,
      followUpQuestions: diagnosticData.followUpQuestions
    };

    if (!isValidJson(finalResult)) {
      return res.status(500).json({ error: "Validation failed" });
    }

    return res.json(finalResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Pipeline failed" });
  }
});

export default router;