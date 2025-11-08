# QT Project — Process Documentation

This document explains the reasoning, workflow, and design evolution of the QT Robot Storytelling project.

---

## 📘 Table of Contents

1. [Story Generation Pipeline — Google TTS](#1-story-generation-pipeline--google-tts)
2. [Story Generation Upgrade — OpenAI TTS](#2-story-generation-upgrade--openai-tts)
3. [Frontend Interaction Design](#3-frontend-interaction-design)
4. [Deployment and Testing](#4-deployment-and-testing)

---

## 1. Story Generation Pipeline — Google TTS

### Decision

Automate story creation with a Node.js script.

### Reasoning

- Simplicity and reproducibility.
- No UI dependency.
- Easy to create multiple stories.

### Challenges

- Timing accuracy for emotions.
- File consistency for merging.

### Future

- Add emotion-based audio blending.
- Web-based generation interface.

---

## 2. Story Generation Upgrade — OpenAI TTS

### Motivation

Google TTS lacked emotional expressiveness.

### Reasoning

- Natural voice quality from OpenAI.
- Fully asynchronous with the same output schema.
- Authentication via environment variable for safety.

### Challenges and Solutions

| Issue             | Resolution        |
| ----------------- | ----------------- |
| Latency           | Async sequencing  |
| Auth              | `.env` variable   |
| Rate limits       | Sequential calls  |
| Merge consistency | FFmpeg processing |

### Future

- Add multilingual support.
- Vary voices per emotion.
- GUI to create stories interactively.

---

## 3. Frontend Interaction Design

### Decision

Use pure JavaScript and HTML.

### Reasoning

- Educational transparency.
- Lightweight and fast.
- Easy to debug and modify.

### Implementation

- Emotion schedule synced with audio timestamps.
- Blinking and mouth movement cycles.
- Buttons generated dynamically.

### Challenges

- Sync precision at millisecond level.
- Smooth transitions between emotions.
- Handling pause/resume logic without desync.

## 4. Deployment and Testing

### Local Setup

```bash
node make_story/make_story.js
node server.js
```
