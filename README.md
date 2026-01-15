# Comms Coach

A communication coaching tool that provides AI-powered feedback on your spoken responses.

## How It Works

1. You talk
2. Your words are transcribed
3. An LLM gives you feedback based on communication best practices

## User Flow

1. User opens the website
2. User is presented with a question/prompt
3. User records their response and uploads the audio
4. Audio is sent to a transcription API
5. Transcript is passed to an LLM for analysis
6. LLM returns feedback as a string
7. Feedback is rendered as markdown and displayed to the user

```mermaid
flowchart TD
    A[User opens website] --> B[Presented with question/prompt]
    B --> C[User records response]
    C --> D[Upload audio file]
    D --> E[Transcription API]
    E --> F[Transcript text]
    F --> G[LLM Analysis]
    G --> H[Feedback string]
    H --> I[Render as Markdown]
    I --> J[Display feedback to user]

    subgraph Frontend
        A
        B
        C
        D
        I
        J
    end

    subgraph Backend
        E
        F
        G
        H
    end
```
   