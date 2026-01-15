import { useState } from 'react'
import './App.css'

function App() {
  const [uploadStatus, setUploadStatus] = useState('')

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('audio', file)

    try {
      const response = await fetch('/api/', {
        method: 'POST',
        body: formData
      })
      const data = await response.json()
      setUploadStatus(`Uploaded: ${data.originalName} (ID: ${data.id})`)
    } catch (error) {
      setUploadStatus(`Error: ${error.message}`)
    }
  }

  return (
    <>
      <h1>Audio Upload</h1>
      <div className="card">
        <input 
          type="file" 
          accept="audio/*" 
          onChange={handleFileUpload}
        />
        {uploadStatus && <p>{uploadStatus}</p>}
      </div>
    </>
  )
}

export default App
