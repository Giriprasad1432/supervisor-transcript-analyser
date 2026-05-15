export default async function callOllama(prompt, systemPrompt = "", retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: 'llama3.2',
                    prompt: prompt,
                    system: systemPrompt,
                    format: 'json',
                    stream: false,
                    options: {
                        temperature: 0.1,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API failed: ${response.status}`);
            }

            const data = await response.json();
            
            try {
                JSON.parse(data.response);
            } catch (parseErr) {
                throw new Error("Invalid JSON returned by LLM");
            }

            return data.response;
            
        } catch (err) {
            if (i === retries - 1) throw err;
            await new Promise(res => setTimeout(res, 1000 * (i + 1)));
        }
    }
}
