require('dotenv').config()
const express = require('express')
const multer = require('multer')
const fs = require('fs')

const app = express()
const port = 3000

const upload = multer({ dest: 'uploads/' })

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads')
}

async function getTranscript(file) {
    const formData = new FormData()
    formData.append('model', 'whisper-large-v3-turbo')
    formData.append('file', new Blob([fs.readFileSync(file.path)], { type: file.mimetype }), file.originalname)
    formData.append('temperature', '0')
    formData.append('response_format', 'verbose_json')

    const response = await fetch(`${process.env.GROQ_API_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: formData
    })

    return response.json()
}

app.get('/', (req, res) => {

})

app.post('/', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file uploaded' })
    }

    const transcript = await getTranscript(req.file)

    res.json({ 
        success: true,
        id: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        transcript
    })
})

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})
