require('dotenv').config()
const express = require('express')
const multer = require('multer')
const fs = require('fs')
const { analyzeTranscript } = require('./analyze')

const app = express()
app.use(express.json())
const port = 3000

const upload = multer({ dest: 'uploads/' })

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads')
}

class ApiError extends Error {
    constructor(message, status) {
        super(message)
        this.status = status
    }
}

const ALLOWED_AUDIO_TYPES = {
    'audio/flac': 'flac',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/mp4': 'mp4',
    'audio/m4a': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/webm': 'webm'
}

async function getTranscript(file) {
    const ext = ALLOWED_AUDIO_TYPES[file.mimetype]
    if (!ext) {
        throw new ApiError(`Unsupported audio format: ${file.mimetype}. Allowed: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm`, 400)
    }

    const formData = new FormData()
    formData.append('model', 'whisper-large-v3-turbo')
    formData.append('file', new Blob([fs.readFileSync(file.path)], { type: file.mimetype }), `audio.${ext}`)
    formData.append('temperature', '0')
    formData.append('response_format', 'verbose_json')

    const response = await fetch(`${process.env.GROQ_API_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: formData
    })

    if (!response.ok) {
        const error = await response.json()
        console.error(`Groq API error ${response.status} - ${JSON.stringify(error)}`)
        throw new ApiError('Groq API error', 500)
    }

    return response.json()
}

app.get('/', (req, res) => {

})

app.post('/', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' })
    }

    try {
        const transcript = await getTranscript(req.file)

        res.json({
            success: true,
            id: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            transcript
        })
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message })
    }
})

app.post('/analyze', async (req, res) => {
    const { transcript, originalQuestion } = req.body

    if (!transcript || !originalQuestion) {
        return res.status(400).json({ error: 'transcript and originalQuestion required' })
    }

    try {
        const feedback = await analyzeTranscript(transcript, originalQuestion)
        res.json({ feedback })
    } catch (err) {
        console.error('Analysis error:', err.message)
        if (err.status === 429) {
            return res.status(429).json({ error: 'Rate limited, wait and retry' })
        }
        res.status(500).json({ error: 'Analysis failed, try again' })
    }
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})
