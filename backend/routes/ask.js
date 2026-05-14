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

GAP ANALYSIS RULE:
A "Gap" is NOT a weakness mentioned in the text. 
A "Gap" is a MISSING PIECE of evidence. 
Look for what the candidate IS NOT doing yet (e.g. if they are great at execution but the transcript says nothing about them training others, that is a Gap in Mentorship).

SCORING:
- Score 6: Great worker, but Gaps show no systems or training evidence.
- Score 7-8: Systems built, but Gaps show missing high-level strategy evidence.

SCHEMA:
{
  "score": { "value": 6, "label": "Productivity", "justification": "Detailed reasoning.", "confidence": "high" },
  "gaps": [{ "dimension": "systems|leadership|strategy", "detail": "What was CONSPICUOUSLY MISSING from the transcript?" }],
  "followUpQuestions": [{ "question": "q", "targetGap": "gap", "lookingFor": "ans" }]
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