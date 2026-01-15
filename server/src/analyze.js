const OpenAI = require('openai')
const fs = require('fs')
const path = require('path')

const SYSTEM_PROMPT = fs.readFileSync(
    path.join(__dirname, 'prompts', 'analyze.txt'),
    'utf-8'
)

async function analyzeTranscript(transcript, originalQuestion) {
    const client = new OpenAI()

    const systemPrompt = SYSTEM_PROMPT.replace('{originalQuestion}', originalQuestion)

    const response = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: transcript }
        ],
        temperature: 0.3
    })

    return response.choices[0].message.content
}

module.exports = { analyzeTranscript }
