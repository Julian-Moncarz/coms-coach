# Text Feedback with Audio Playback Spec

## Overview

Text-based feedback where the LLM can embed playback chips that reference segments of the user's original recording. No audio editing or splicing required.

## Page Layout

- **Top of page (always visible):** Full audio playback button for the user's complete recording
- **Below:** LLM's text feedback with embedded audio playback chips

## The LLM Response Format

Written text feedback with special tokens that reference timestamp ranges:

```
Great opening. Listen to this:

[AUDIO: 0:05-0:12]

Strong claim. Notice the hesitation here though:

[AUDIO: 0:23-0:31]

Your closing was direct and confident:

[AUDIO: 1:45-1:58]
```

## The UI Renders

- Text as text
- Tokens as clickable audio player chips that play that segment of the original recording

## Technical Requirement

Only requires timestamped transcription. The LLM receives the transcript with word-level timestamps so it can reference specific moments. No audio manipulation needed - chips just play timestamp ranges from the original file.

## What This Doesn't Have

- No "cleaned" audio (filler words removed)
- No audio splicing or editing
- No voice cloning

## Key Difference From Other Specs

This is the minimal version. No Descript-style editing. Just text feedback with "listen to this part" chips.
