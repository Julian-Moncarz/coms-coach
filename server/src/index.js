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

app.listen(port, () => {
    console.log(`Example app listening on http://localhost:${port}`)
})
