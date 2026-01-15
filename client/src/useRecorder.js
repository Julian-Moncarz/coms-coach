import { useState, useRef, useCallback } from 'react'

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  const startRecording = useCallback(async () => {
    setError(null)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setElapsedTime(0)

      // Start timer
      const startTime = Date.now()
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
      }, 100)

      return true // Success

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone access is required to record. Please allow access and try again.')
      } else {
        setError('Could not start recording. Please try again.')
      }
      console.error('Recording error:', err)
      return false // Failed
    }
  }, [])

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current

      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        resolve(null)
        return
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      mediaRecorder.onstop = () => {
        // Create blob from chunks
        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })

        // Stop all tracks to release mic
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        setIsRecording(false)
        resolve(blob)
      }

      mediaRecorder.stop()
    })
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isRecording,
    elapsedTime,
    formattedTime: formatTime(elapsedTime),
    error,
    startRecording,
    stopRecording,
    clearError: () => setError(null)
  }
}
