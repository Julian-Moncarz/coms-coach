import { useState } from 'react'
import { getRandomQuestion } from './questions'
import { useRecorder } from './useRecorder'
import './App.css'

// UI States: idle | recording | processing | feedback
function App() {
  const [uiState, setUiState] = useState('idle')
  const [currentQuestion, setCurrentQuestion] = useState(() => getRandomQuestion())
  const [feedback, setFeedback] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  const {
    formattedTime,
    error: recorderError,
    startRecording: startRecorderFn,
    stopRecording,
    clearError
  } = useRecorder()

  const handleStartRecording = async () => {
    setSubmitError(null)
    clearError()
    const success = await startRecorderFn()
    if (success) {
      setUiState('recording')
    }
  }

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording()
    if (!audioBlob) return

    setUiState('processing')

    try {
      const formData = new FormData()
      // Determine file extension from blob type
      const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm'
      formData.append('audio', audioBlob, `recording.${ext}`)
      formData.append('question', currentQuestion.text)

      const response = await fetch('/api/', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.feedback) {
        setFeedback(data.feedback)
        setUiState('feedback')
      } else {
        // Server doesn't return feedback yet - show placeholder
        setFeedback('_Your recording was uploaded successfully. Feedback will appear here once transcription is connected._')
        setUiState('feedback')
      }
    } catch (err) {
      setSubmitError('Failed to submit recording. Please try again.')
      setUiState('idle')
      console.error('Upload error:', err)
    }
  }

  const handleTryAgain = () => {
    setFeedback(null)
    setSubmitError(null)
    setUiState('idle')
  }

  const handleNewQuestion = () => {
    setCurrentQuestion(getRandomQuestion(currentQuestion.id))
    setFeedback(null)
    setSubmitError(null)
    setUiState('idle')
  }

  const error = recorderError || submitError

  return (
    <div className="app">
      <header className="header">
        <span className="logo-mark">CC</span>
        <h1 className="title">Comms Coach</h1>
      </header>

      <main className="main">
        {uiState !== 'feedback' && (
          <section className="question-section">
            <span className="question-label">Your prompt</span>
            <h2 className="question-text">{currentQuestion.text}</h2>
          </section>
        )}

        {uiState === 'idle' && (
          <div className="record-section">
            <button
              className="record-button"
              onClick={handleStartRecording}
            >
              <span className="record-icon" />
              <span>Start Recording</span>
            </button>
            <p className="hint">Click to begin. Aim for 30 seconds to 2 minutes.</p>
          </div>
        )}

        {uiState === 'recording' && (
          <div className="record-section recording-active">
            <div className="recording-indicator">
              <span className="pulse" />
              <span className="time">{formattedTime}</span>
            </div>
            <button
              className="stop-button"
              onClick={handleStopRecording}
            >
              <span className="stop-icon" />
              <span>Stop Recording</span>
            </button>
          </div>
        )}

        {uiState === 'processing' && (
          <div className="processing-section">
            <div className="loader" />
            <p className="processing-text">Analyzing your response...</p>
          </div>
        )}

        {uiState === 'feedback' && (
          <div className="feedback-section">
            <div className="feedback-header">
              <span className="feedback-label">Feedback</span>
              <p className="feedback-question">"{currentQuestion.text}"</p>
            </div>
            <div
              className="feedback-content"
              dangerouslySetInnerHTML={{ __html: formatMarkdown(feedback) }}
            />
            <div className="feedback-actions">
              <button className="action-button secondary" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="action-button primary" onClick={handleNewQuestion}>
                New Question
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => { clearError(); setSubmitError(null); }}>Dismiss</button>
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Practice makes permanent. Keep going.</p>
      </footer>
    </div>
  )
}

// Simple markdown formatter (handles basics for feedback display)
function formatMarkdown(text) {
  if (!text) return ''

  return text
    // Headers
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Wrap in paragraph
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
}

export default App
