# Two Modes Design: Q&A Practice + Presentation Practice

## Overview

Add a second modality to the app: Presentation Practice. Users can toggle between Q&A mode (existing) and Presentation mode (new) via tabs at the top.

## Mode Toggle

- Tab-style toggle at top: "Q&A Practice" | "Presentation Practice"
- Q&A is the default mode
- Toggle is always visible and always clickable
- Switching modes:
  - Discards any in-progress recording
  - Clears any displayed feedback
  - Resets UI to idle state for the new mode

## Q&A Mode (Existing)

No changes to current behavior:
- Random question displayed from question bank
- Record response → get feedback
- Action buttons: "Try Again" (same question) | "New Question"
- Duration guidance: 30 seconds to 2 minutes

## Presentation Mode (New)

### Idle State

- **Topic input**: Large text field with helper text "What are you presenting about?"
- **Topic is optional**: Users can record without entering anything
- **No duration guidance**: Unlike Q&A mode, no text about recommended response length
- **Record button**: Same "Start Recording" button, always enabled

### Recording State

Identical to Q&A mode:
- Same recording UI (pulsing indicator, timer, stop button)
- Same `useRecorder` hook behavior
- Topic field remains visible but not editable during recording

### Feedback State

- **Feedback content**: Same format as Q&A ("What worked" / "What to work on")
- **Same coaching criteria**: Uses identical communication principles rubric
- **Topic field visible**: Stays at top, pre-filled with user's input, remains editable
- **Single action button**: "Start Presentation Again"

Clicking "Start Presentation Again" clears feedback and returns to idle with topic preserved.

## Backend Integration

No backend changes required. Same endpoint, same payload structure:

| Mode | Payload |
|------|---------|
| Q&A | `{ transcript, question: "randomly selected question" }` |
| Presentation | `{ transcript, question: "user's topic input" }` |

If user leaves topic empty, send: `"freeform presentation practice"` as fallback.

## State Management

New state: `mode` ("qa" | "presentation")

### State Transitions

- Mode toggle click → set `mode`, reset to idle, clear feedback
- Topic input → controlled state, persists through recording/feedback cycle
- "Start Presentation Again" → clear feedback, keep topic, return to idle

### What Stays the Same

- Recording state machine (idle → recording → processing → feedback)
- `useRecorder` hook
- Backend endpoints
- Feedback display component
- Styling system

### What Changes

- `App.jsx` conditionally renders question display (Q&A) or topic input (presentation)
- `App.jsx` conditionally renders action buttons based on mode
- Form submission sends `question` field with either random question or user topic

## Summary Table

| Aspect | Q&A Mode | Presentation Mode |
|--------|----------|-------------------|
| Top area | Random question from bank | Large text input with helper text |
| Topic required | N/A | No (fallback: "freeform presentation practice") |
| Duration guidance | Yes (30s-2min) | None |
| After feedback | "Try Again" + "New Question" | "Start Presentation Again" |
| Topic persistence | N/A | Persists and stays editable |
| Coaching criteria | Communication principles | Same |
