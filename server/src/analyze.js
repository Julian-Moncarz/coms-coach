const fs = require('fs')
const path = require('path')

const SYSTEM_PROMPT = fs.readFileSync(
    path.join(__dirname, 'prompts', 'analyze.txt'),
    'utf-8'
)

async function analyzeTranscript(transcript, originalQuestion) {
    const response = await fetch(`${process.env.ANALYZE_API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ANALYZE_API_KEY}`
        },
        body: JSON.stringify({
            model: process.env.ANALYZE_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT.replace('{originalQuestion}', originalQuestion) },
                { role: 'user', content: transcript }
            ],
            temperature: 0.3
        })
    })

    if (!response.ok) {
        const error = await response.json()
        console.error(`OpenAI API error ${response.status} - ${JSON.stringify(error)}`)
        throw new Error('OpenAI API error')
    }

    return (await response.json()).choices[0].message.content
}

module.exports = { analyzeTranscript }
