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

app.get('/', (req, res) => {

})

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' })
    }

    const ext = ALLOWED_AUDIO_TYPES[req.file.mimetype]
    if (!ext) {
        return res.status(400).json({ error: `Unsupported audio format: ${req.file.mimetype}. Allowed: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm` })
    }

    const formData = new FormData()
    formData.append('model', process.env.TRANSCRIPT_MODEL)
    formData.append('file', new Blob([fs.readFileSync(req.file.path)], { type: req.file.mimetype }), `audio.${ext}`)
    formData.append('temperature', '0')
    formData.append('response_format', 'verbose_json')

    const response = await fetch(`${process.env.TRANSCRIPT_API_URL}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.TRANSCRIPT_API_KEY}`
        },
        body: formData
    })

    if (!response.ok) {
        const error = await response.json()
        console.error(`Transcript API error ${response.status} - ${JSON.stringify(error)}`)
        return res.status(500).json({ error: 'Transcript API error' })
    }

    const transcript = await response.json()

    res.json({
        success: true,
        id: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        transcript
    })
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
