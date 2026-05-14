export function isValidJson(data) {
  return (
    data &&
    data.score &&
    typeof data.score.value === "number" &&
    Array.isArray(data.evidence) &&
    Array.isArray(data.kpiMapping) &&
    Array.isArray(data.gaps) &&
    Array.isArray(data.followUpQuestions)
  );
}