export default async function callOllama(prompt){
    const response = await fetch('http://localhost:11434/generate',
        {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ model: 'llama3.1', prompt, stream: false })
        })
    if (!response.ok) {
        throw new Error('Ollama AI API request failed')
    }
    const data = await response.json();
    return data.response;
}
