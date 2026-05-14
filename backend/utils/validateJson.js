export function isValidJson(data) {

  if (!data || !data.score) return false;


  const scoreVal = Number(data.score.value);
  if (isNaN(scoreVal)) return false;

  const hasArrays = 
    Array.isArray(data.evidence) &&
    Array.isArray(data.kpiMapping) &&
    Array.isArray(data.gaps) &&
    Array.isArray(data.followUpQuestions);

  return hasArrays;
}