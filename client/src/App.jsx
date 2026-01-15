import { useState } from 'react'
import Markdown from 'react-markdown'
import { getRandomQuestion } from './questions'
import { useRecorder } from './useRecorder'

// UI States: idle | recording | processing | feedback
// Modes: qa | presentation
function App() {
  const [mode, setMode] = useState('qa')
  const [uiState, setUiState] = useState('idle')
  const [currentQuestion, setCurrentQuestion] = useState(() => getRandomQuestion())
  const [topic, setTopic] = useState('')
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

  const getTranscript = async (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob)

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`)
    }

    const data = await response.json()
    return data.transcript.text
  }

  const analyzeTranscript = async (transcript, question) => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript, originalQuestion: question })
    })

    if (!response.ok) {
      throw new Error(`Analysis failed: ${response.status}`)
    }

    const data = await response.json()
    return data.feedback
  }

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording()
    if (!audioBlob) return

    setUiState('processing')

    try {
      const prompt = mode === 'qa'
        ? currentQuestion.text
        : (topic.trim() || 'freeform presentation practice')

      const transcript = await getTranscript(audioBlob)
      const feedback = await analyzeTranscript(transcript, prompt)

      setFeedback(feedback)
      setUiState('feedback')
    } catch (err) {
      setSubmitError('Failed to submit recording. Is the server running?')
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

  const handleModeChange = (newMode) => {
    if (newMode === mode) return
    setMode(newMode)
    setUiState('idle')
    setFeedback(null)
    setSubmitError(null)
    clearError()
  }

  const handleStartPresentationAgain = () => {
    setFeedback(null)
    setSubmitError(null)
    setUiState('idle')
  }

  const error = recorderError || submitError

  return (
    <div className="flex flex-col min-h-screen w-full max-w-[720px] mx-auto py-lg px-md box-border">
      {/* Header */}
      <header className="flex items-center gap-sm mb-xl animate-fade-slide-down">
        <span className="font-display text-xl italic text-accent w-10 h-10 flex items-center justify-center border-[1.5px] border-accent rounded-sm">
          CC
        </span>
        <h1 className="font-body text-sm font-medium tracking-[0.1em] uppercase text-text-secondary m-0">
          Comms Coach
        </h1>
        <nav className="ml-auto flex items-center gap-xs">
          <button
            className={`font-body text-xs font-medium tracking-[0.05em] bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 ${
              mode === 'qa' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
            onClick={() => handleModeChange('qa')}
          >
            Q&A
          </button>
          <span className="text-text-muted text-xs">·</span>
          <button
            className={`font-body text-xs font-medium tracking-[0.05em] bg-transparent border-none p-0 cursor-pointer transition-colors duration-200 ${
              mode === 'presentation' ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            }`}
            onClick={() => handleModeChange('presentation')}
          >
            Presentation
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        {/* Question Section (Q&A Mode) */}
        {mode === 'qa' && uiState !== 'feedback' && (
          <section className="w-full min-h-[140px] mb-xl animate-fade-slide-up-delay">
            <span className="block text-xs font-medium tracking-[0.15em] uppercase text-text-muted mb-sm">
              Your prompt
            </span>
            <h2 className="font-display text-[clamp(1.75rem,5vw,2.5rem)] font-normal leading-[1.3] text-text-primary m-0">
              {currentQuestion.text}
            </h2>
          </section>
        )}

        {/* Topic Section (Presentation Mode) */}
        {mode === 'presentation' && uiState !== 'feedback' && (
          <section className="w-full min-h-[140px] mb-xl animate-fade-slide-up-delay">
            <label
              className="block text-xs font-medium tracking-[0.15em] uppercase text-text-muted mb-sm"
              htmlFor="topic-input"
            >
              What are you presenting about?
            </label>
            <textarea
              id="topic-input"
              className="block w-full box-border m-0 p-0 pb-xs font-display text-[clamp(1.75rem,5vw,2.5rem)] font-normal leading-[1.3] text-text-primary bg-transparent border-none border-b-[1.5px] border-b-text-muted rounded-none transition-colors duration-200 resize-none overflow-hidden placeholder:text-text-muted focus:outline-none focus:border-b-accent disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fieldSizing: 'content' }}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic..."
              disabled={uiState === 'recording' || uiState === 'processing'}
              rows={1}
            />
          </section>
        )}

        {/* Idle State - Record Button */}
        {uiState === 'idle' && (
          <div className="flex flex-col items-center gap-md py-xl animate-fade-slide-up-delay-2">
            <button
              className="flex items-center gap-sm py-md px-lg font-body text-base font-medium text-text-primary bg-bg-surface border-[1.5px] border-text-muted rounded-full cursor-pointer transition-all duration-300 hover:border-accent hover:bg-bg-elevated hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] active:translate-y-0 group"
              onClick={handleStartRecording}
            >
              <span className="w-3 h-3 bg-accent rounded-full transition-transform duration-200 group-hover:scale-[1.2]" />
              <span>Start Recording</span>
            </button>
          </div>
        )}

        {/* Recording State */}
        {uiState === 'recording' && (
          <div className="flex flex-col items-center gap-md py-xl">
            <div className="flex items-center gap-sm py-sm px-md bg-accent/10 border border-accent/30 rounded-full mb-sm">
              <span className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse-dot" />
              <span className="font-body text-xl font-medium tabular-nums text-accent min-w-14">
                {formattedTime}
              </span>
            </div>
            <button
              className="flex items-center gap-sm py-md px-lg font-body text-base font-medium text-bg-deep bg-accent border-none rounded-full cursor-pointer transition-all duration-300 shadow-[0_0_0_0_var(--color-accent-glow)] animate-glow-pulse hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(232,93,69,0.4)]"
              onClick={handleStopRecording}
            >
              <span className="w-3 h-3 bg-bg-deep rounded-sm" />
              <span>Stop Recording</span>
            </button>
          </div>
        )}

        {/* Processing State */}
        {uiState === 'processing' && (
          <div className="flex flex-col items-center gap-md py-xl animate-fade-in">
            <div className="w-10 h-10 border-2 border-bg-elevated border-t-accent rounded-full animate-spin" />
            <p className="text-sm text-text-secondary m-0">Analyzing your response...</p>
          </div>
        )}

        {/* Feedback State */}
        {uiState === 'feedback' && (
          <div className="animate-fade-slide-up">
            {/* Feedback Header */}
            <div className="mb-lg pb-md border-b border-bg-elevated">
              <span className="block text-xs font-medium tracking-[0.15em] uppercase text-accent mb-xs">
                Feedback
              </span>
              <p className="font-display text-lg italic text-text-secondary m-0">
                "{mode === 'qa' ? currentQuestion.text : (topic.trim() || 'freeform presentation practice')}"
              </p>
            </div>

            {/* Feedback Content */}
            <div
              className="text-base leading-[1.7] text-text-primary
                [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-normal [&_h2]:text-text-primary [&_h2]:mt-lg [&_h2]:mb-sm
                [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-normal [&_h3]:text-text-primary [&_h3]:mt-md [&_h3]:mb-sm
                [&_h4]:font-body [&_h4]:text-sm [&_h4]:font-medium [&_h4]:tracking-[0.05em] [&_h4]:uppercase [&_h4]:text-accent-soft [&_h4]:mt-md [&_h4]:mb-xs
                [&_p]:m-0 [&_p]:mb-sm
                [&_strong]:text-text-primary [&_strong]:font-medium
                [&_em]:italic [&_em]:text-text-secondary"
            >
              <Markdown>{feedback}</Markdown>
            </div>

            {/* Feedback Actions */}
            <div className="flex gap-sm mt-xl pt-lg border-t border-bg-elevated">
              {mode === 'qa' ? (
                <>
                  <button
                    className="flex-1 py-sm px-md font-body text-sm font-medium rounded-md cursor-pointer transition-all duration-200 text-text-secondary bg-transparent border-[1.5px] border-bg-elevated hover:text-text-primary hover:border-text-muted hover:bg-bg-surface"
                    onClick={handleTryAgain}
                  >
                    Try Again
                  </button>
                  <button
                    className="flex-1 py-sm px-md font-body text-sm font-medium rounded-md cursor-pointer transition-all duration-200 text-bg-deep bg-[#a09a95] border-[1.5px] border-[#a09a95] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(200,195,190,0.2)]"
                    onClick={handleNewQuestion}
                  >
                    New Question
                  </button>
                </>
              ) : (
                <button
                  className="flex-1 py-sm px-md font-body text-sm font-medium rounded-md cursor-pointer transition-all duration-200 text-bg-deep bg-[#a09a95] border-[1.5px] border-[#a09a95] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(200,195,190,0.2)]"
                  onClick={handleStartPresentationAgain}
                >
                  Start Presentation Again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-between gap-sm mt-md py-sm px-md bg-error/10 border border-error/30 rounded-md animate-fade-slide-up">
            <p className="m-0 text-sm text-error">{error}</p>
            <button
              className="py-xs px-sm font-body text-xs font-medium text-text-secondary bg-transparent border border-text-muted rounded-sm cursor-pointer transition-all duration-200 hover:text-text-primary hover:border-text-primary"
              onClick={() => { clearError(); setSubmitError(null); }}
            >
              Dismiss
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-xl text-center animate-fade-in-delay">
        <p className="font-display text-sm italic text-text-muted m-0">
          Practice makes permanent. Keep going.
        </p>
      </footer>
    </div>
  )
}

export default App
