export default async function callOllama(prompt) {
    const response = await fetch('http://localhost:11434/api/generate',
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: 'llama3.2', prompt, stream: false })
        })
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API failed (${response.status}): ${errorText}`);
    }
    const data = await response.json();
    return data.response;
}
