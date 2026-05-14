export function isValidJson(data) {

  return (
    data &&
    Array.isArray(data.evidence) &&
    data.evidence.every(
      item =>
        typeof item.quote === "string" &&
        typeof item.sentiment === "string"
    ) &&
    typeof data.score === "number" &&
    typeof data.justification === "string" &&
    Array.isArray(data.gaps) &&
    Array.isArray(data.follow_up_questions) &&
    data.gaps.length === data.follow_up_questions.length
  );

}