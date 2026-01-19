# Text + Audio Hybrid Feedback Spec

## Overview

A text-based feedback experience with embedded audio playback chips. The coach provides written feedback but can reference specific moments from the user's recording as playable audio clips.

## Page Layout

- **Top of page (always visible):** Full audio playback button for the user's complete recording
- **Below:** LLM's text feedback with embedded audio chips

## The LLM Response Format

Written text feedback (like today), BUT the LLM can embed special tokens that get parsed/rendered as audio playback chips:

```
Great structure overall. But notice the filler words here:

[ORIGINAL_AUDIO: "So, um, the first thing is, like, we need to improve"]

Here's what it sounds like cleaned up:

[CLEANED_AUDIO: "The first thing is we need to improve"]

Much stronger. Your closing was solid:

[ORIGINAL_AUDIO: "Let's schedule a follow-up next week"]
```

## The UI Renders

- Text as text
- Those tokens as clickable audio player chips (little inline players)

## Possible Extension

Voice cloning - coach could say "here's a more eloquent phrasing" and play a generated clip in the user's own voice.

## Technical Requirement

This requires Descript-style audio editing - the ability to edit/splice audio by editing the transcript text. The transcript must have word-level timestamps so that text references can be matched back to audio segments.

**Feasibility:** Two viable approaches:

1. **Resemble AI** - API that lets you edit audio by editing transcript text, maintains original voice
2. **DIY with Deepgram** - Transcription with word-level timestamps + custom audio splicing

The "cleaned up" playback (filler words removed) may sound slightly choppy without sophisticated audio smoothing, but core concept works.

## Key Difference From Audio Feedback Spec

Coach feedback is text, but with embedded listenable clips. Not a fully-audio experience.
