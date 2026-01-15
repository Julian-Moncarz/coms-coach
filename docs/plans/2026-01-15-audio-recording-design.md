# Audio Recording Feature Design

## Overview

Add client-side audio recording capability so users can practice answering questions and receive feedback without manually uploading files.

## User Flow

1. User lands on app, sees a random question from the bank
2. User clicks "Start Recording" → browser requests mic permission (first time only)
3. Recording indicator shows elapsed time and visual "live" state
4. User clicks "Stop Recording" → audio auto-submits to server
5. Loading state while waiting for feedback
6. Feedback displays as markdown
7. User chooses "Try Again" (same question) or "New Question" (random)

## UI Components

### QuestionDisplay
Shows the current practice question text.

### RecordButton
Toggles between "Start Recording" and "Stop Recording" states.

### RecordingIndicator
Visual feedback during recording: elapsed time, pulsing indicator.

### FeedbackDisplay
Renders markdown feedback from the analysis endpoint.

## UI States

| State | Description |
|-------|-------------|
| `idle` | Ready to record, showing question |
| `recording` | Mic is live, showing elapsed time |
| `processing` | Audio submitted, waiting for feedback |
| `feedback` | Showing results with "Try Again" / "New Question" options |

## Recording Implementation

**Technology:** Browser MediaRecorder API

**Flow:**
```
Start Recording
  → getUserMedia({ audio: true })
  → Create MediaRecorder from stream
  → Collect chunks via ondataavailable

Stop Recording
  → mediaRecorder.stop()
  → Create Blob from chunks
  → POST to /api/ as FormData (audio + question text)
  → Transition to processing state
```

**Audio format:** Browser default (WebM for Chrome/Firefox, MP4 for Safari)

**Error handling:**
- Mic permission denied → show message, stay idle
- Recording fails → show error, allow retry
- Upload fails → show error, allow retry without losing recording

**Cleanup:** Stop all audio tracks when recording ends to release mic.

## Question Bank

**Structure:**
```javascript
const questions = [
  { id: "1", text: "Tell me about a time you had to persuade someone." },
  { id: "2", text: "Explain what you do for work to someone outside your field." },
  // 10-20 questions to start
]
```

**Location:** Client-side JS array or JSON file.

**Selection logic:**
- On load: pick random question
- "New Question": pick random, avoid repeating current
- "Try Again": keep same question

## Client-Server Contract

**Client sends:**
- Audio file (Blob)
- Question text (string)

**Client receives:**
- `{ feedback: "markdown..." }` on success
- `{ error: "..." }` on failure

Server orchestrates transcription and analysis internally.

## Out of Scope

- Transcription API integration (separate work)
- Server-side changes beyond existing upload endpoint
- Mobile browser support
- Question categories or filtering
- Skip/next question before answering

## Constraints

- Desktop only (Chrome, Firefox, Safari, Edge)
- Response length: 30 seconds to 2 minutes
- Manual start/stop control
