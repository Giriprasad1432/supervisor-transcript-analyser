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

router.post("/", async (req, res) => {
  const { transcript } = req.body;
  
  if (!transcript) {
    return res.status(400).json({ error: "No transcript provided." });
  }

  try {
    // first get the facts
    const result1 = await callOllama(transcript, prompt1);
    const factData = JSON.parse(result1);

    // then do the scoring
    const input2 = `Transcript: ${transcript}\n\nEvidence: ${JSON.stringify(factData.evidence)}`;
    const result2 = await callOllama(input2, prompt2);
    const diagnosticData = JSON.parse(result2);

    const finalResult = {
      ...factData,
      ...diagnosticData
    };

    if (!isValidJson(finalResult)) {
      return res.status(500).json({ error: "failed validation" });
    }

    return res.json(finalResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;