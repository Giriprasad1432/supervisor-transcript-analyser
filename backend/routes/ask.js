import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

const router = express.Router();

const prompt1 = `
Identify facts. 
KPIs: Lead Gen, Lead Conv, Upselling, Cross-selling, NPS, PAT, TAT, Quality.

SCHEMA:
{
  "evidence": [{ "quote": "actual quote", "signal": "positive", "dimension": "execution", "interpretation": "meaning" }],
  "kpiMapping": [{ "kpi": "Quality", "evidence": "fact", "systemOrPersonal": "personal" }]
}
`;

const prompt2 = `
Role: Diagnostic Critic.

GAP ANALYSIS:
- A "Gap" is a MISSING PIECE of evidence for Layer 2/3 performance.

FOLLOW-UP RULE:
- For EVERY gap identified, you MUST generate AT LEAST one strategic follow-up question.
- You can generate multiple questions for a single gap if it helps clarify the performance level.
- Total questions must be >= Total gaps.

SCHEMA:
{
  "score": { "value": 6, "label": "Productivity", "justification": "Detailed reasoning.", "confidence": "high" },
  "gaps": [{ "dimension": "systems|mentorship|strategy", "detail": "Missing evidence detail." }],
  "followUpQuestions": [{ "question": "Strategic question?", "targetGap": "dimension name", "lookingFor": "What answer would prove Layer 2?" }]
}
`;

router.post("/", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: "No transcript." });

  try {
    const res1 = await callOllama(transcript, prompt1);
    const data1 = JSON.parse(res1);
    
    if (!Array.isArray(data1.evidence)) throw new Error("Invalid format");

    const input2 = `Evidence: ${JSON.stringify(data1.evidence)}`;
    const res2 = await callOllama(input2, prompt2);
    const data2 = JSON.parse(res2);

    const result = {
      score: data2.score || { value: 0, label: "Error" },
      evidence: data1.evidence,
      kpiMapping: data1.kpiMapping || [],
      gaps: data2.gaps || [],
      followUpQuestions: data2.followUpQuestions || []
    };

    if (!isValidJson(result)) {
      console.log("Validation failed on:", JSON.stringify(result, null, 2));
      return res.status(500).json({ error: "Validation failed" });
    }

    return res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failure" });
  }
});

export default router;