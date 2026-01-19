# Audio Feedback Feature Spec

## Overview

Replace text-based feedback with an audio experience. The user records, then receives a compiled audio file where a coach voice reviews their performance, interleaved with playback of their own words.

## User Experience

1. User records audio and clicks done
2. Brief processing state
3. User receives an audio file that auto-plays
4. The audio is a "coaching session" - coach commentary interleaved with clips of the user's own recording

## The Script Format

After transcription, an LLM generates a script with interleaved Coach and User lines:

```
Coach: Great opening. You stated your main point clearly.
User: I think we should focus on three main areas for growth.
Coach: Notice the filler words in this next section. Here's what you said:
User: So, um, the first thing is, like, we need to, you know, improve our process.
Coach: And here's what it would sound like cleaned up:
User: The first thing is we need to improve our process.
Coach: Strong finish. Your call to action was direct.
User: Let's schedule a follow-up next week to review progress.
Coach: Overall, solid structure. Focus on reducing filler words and you'll sound more confident.
```

- **Coach lines**: The LLM writes these (feedback, commentary, transitions)
- **User lines**: Exact text from the transcript, or edited versions (filler words removed)

## Compiled Output

The script gets compiled into a single audio file:

- **Coach lines** → Text-to-speech API
- **User lines** → Matched against timestamped transcript, spliced from original recording

The user hears their own voice playing back, with coach commentary inserted at key moments.

## Feasibility

Technically feasible. Two viable approaches:

1. **Resemble AI** - API that lets you edit audio by editing transcript text, maintains original voice
2. **DIY with Deepgram** - Transcription with word-level timestamps + custom audio splicing

The "cleaned up" playback (filler words removed) may sound slightly choppy without sophisticated audio smoothing, but core concept works.

## Out of Scope (for this spec)

- How the LLM prompt is structured
- Specific TTS voice selection
- UI for replaying/scrubbing the audio
- Fallback to text feedback
