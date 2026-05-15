import express from "express";
import callOllama from "../services/ollamaService.js";
import { isValidJson } from "../utils/validateJson.js";

const router = express.Router();

const prompt1 = `
Role: High-Precision Fact Extractor.

KPI DEFINITIONS:
- Lead Gen: Finding new opportunities
- Lead Conv: Closing deals/enrollments
- Upselling: Higher value orders
- Cross-selling: Related product sales
- NPS: Customer satisfaction/feedback
- PAT: Process/Task completion efficiency
- TAT: Deadlines, speed, delays, turnaround time
- Quality: Accuracy, work ethic, excellence, passion

GUARDRAILS (ANTI-HALLUCINATION):
- DO NOT invent or paraphrase quotes. You MUST extract exact verbatim sentences from the transcript.
- If a KPI is not mentioned, DO NOT map it.
- DO NOT assume positive intent if it's not explicitly stated.
- NEVER use placeholder text like "quote" or "..." in your response.

SCHEMA:
{
  "evidence": [{ "quote": "ACTUAL_QUOTE", "signal": "positive", "dimension": "execution", "interpretation": "WHY_IT_MATTERS" }],
  "kpiMapping": [{ "kpi": "Quality", "evidence": "ACTUAL_QUOTE", "systemOrPersonal": "personal" }]
}
`;

const prompt2 = `
Role: Diagnostic Critic.

GAP ANALYSIS:
- A "Gap" is missing evidence for Layer 2/3 performance.
- dimension MUST be exactly one of: systems, mentorship, strategy.
- NEVER combine dimensions with a pipe (e.g., NO "strategy|systems").

SCORING:
- MAX Score 6 for Layer 1 (execution).
- Score 7+ ONLY if there is clear evidence of system building.

FOLLOW-UP RULE:
- For EVERY gap, you MUST generate at least one follow-up question.
- The "lookingFor" field MUST explain exactly what answer would prove high performance.
- NEVER use "Detailed reasoning" or "Strategic question" or "Missing evidence detail" as your output.

SCHEMA:
{
  "score": { "value": 6, "label": "Productivity", "justification": "WRITE_REAL_REASONING_HERE" },
  "gaps": [
    { "dimension": "systems", "detail": "DESCRIBE_THE_SPECIFIC_VOID" }
  ],
  "followUpQuestions": [
    { "question": "ASK_A_SPECIFIC_QUESTION", "targetGap": "systems", "lookingFor": "EXPLAIN_THE_DIAGNOSTIC_GOAL" }
  ]
}
`;

router.post("/", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) return res.status(400).json({ error: "No transcript." });

  try {
    const res1 = await callOllama(transcript, prompt1);
    const data1 = JSON.parse(res1);

    if (!Array.isArray(data1.evidence)) throw new Error("Invalid format from Phase 1");

    const input2 = `Evidence: ${JSON.stringify(data1.evidence)}`;
    const res2 = await callOllama(input2, prompt2);
    const data2 = JSON.parse(res2);

    const result = {
      score: data2.score || { value: 0, label: "Error" },
      evidence: (data1.evidence || []).filter(ev => {
        const quote = String(ev.quote || "").toLowerCase();
        return quote.length > 5 && !quote.includes("quote") && !quote.includes("...");
      }),
      kpiMapping: (data1.kpiMapping || []).filter(kpi => {
        const evidence = String(kpi.evidence || "").toLowerCase();
        return evidence.length > 0 && !evidence.includes("quote") && !evidence.includes("...");
      }),
      gaps: (data2.gaps || []).filter(gap => {
        const detail = String(gap.detail || "").toLowerCase();
        return detail.length > 0 && !detail.includes("void") && !detail.includes("missing");
      }).map(gap => ({
        ...gap,
        dimension: String(gap.dimension || "").split('|')[0].trim()
      })),
      followUpQuestions: (data2.followUpQuestions || []).filter(q => {
        const question = String(q.question || "").toLowerCase();
        return question.length > 0 && !question.includes("question") && !question.includes("goal");
      }).map(q => ({
        ...q,
        targetGap: String(q.targetGap || "").split('|')[0].trim()
      }))
    };

    if (!isValidJson(result)) {
      return res.status(500).json({ error: "Validation failed" });
    }

    return res.json(result);

  } catch (err) {
    res.status(500).json({ error: "Analysis failure" });
  }
});

export default router;