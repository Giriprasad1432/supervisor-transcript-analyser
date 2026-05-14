export function isValidJson(data) {
    return (
        data &&
        Array.isArray(data.evidence) &&
        typeof data.score === "number" &&
        typeof data.justification === "string" &&
        Array.isArray(data.gaps) &&
        Array.isArray(data.follow_up_questions)
    );

}