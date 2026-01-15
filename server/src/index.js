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

app.get('/', (req, res) => {

})

app.post('/', upload.single('audio'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' })
    }
    res.json({
        success: true,
        id: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size
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
