export function vaildateJson(data){
    return(
        data && Array.isArray(data) &&
        typeof data.score==="number" &&
        typeof data.justification==="string" &&
        Array.isArray(data.gaps) &&
        Array.isArray(data.follow_up_questions)
    )
}

