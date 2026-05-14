import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

const router = express.Router();

const prompt1 = `
Task: Extract evidence from this transcript.
Format: JSON only.

SCHEMA:
{
  "evidence": [{ "quote": "string", "signal": "positive|neutral|negative", "dimension": "execution|systems_building", "interpretation": "string" }],
  "kpiMapping": [{ "kpi": "string", "evidence": "string", "systemOrPersonal": "system|personal" }]
}
`;

const prompt2 = `
Task: Evaluate this candidate based on the transcript and evidence.
Rules: Score 6 is the ceiling for Layer 1 (helping/firefighting). Score 7+ requires Layer 2 (systems).

SCHEMA:
{
  "score": { "value": number, "label": "Productivity|Performance", "band": "string", "justification": "string", "confidence": "high" },
  "gaps": [{ "dimension": "string", "detail": "string" }],
  "followUpQuestions": [{ "question": "string", "targetGap": "string", "lookingFor": "string" }]
}
`;

router.post("/", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: "No transcript." });

  try {
    const res1 = await callOllama(transcript, prompt1);
    const data1 = JSON.parse(res1);

    const input2 = `Transcript: ${transcript}\n\nEvidence: ${JSON.stringify(data1.evidence)}`;
    const res2 = await callOllama(input2, prompt2);
    const data2 = JSON.parse(res2);

    const finalResult = {
      score: data2.score,
      evidence: data1.evidence || [],
      kpiMapping: data1.kpiMapping || [],
      gaps: data2.gaps || [],
      followUpQuestions: data2.followUpQuestions || []
    };

    if (!isValidJson(finalResult)) {
      return res.status(500).json({ error: "Validation failed" });
    }

    return res.json(finalResult);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

export default router;