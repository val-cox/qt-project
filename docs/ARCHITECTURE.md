# QT Project — Architecture Overview

The QT Project is a web-based storytelling system where the QT Robot narrates stories with emotional expressions.  
It combines Node.js, automated TTS story generation, and an interactive web interface for children.

---

## Table of Contents

1. [Server Design](#1-server-design)
2. [Story Creation Tools — `make_story/`](#2-story-creation-tools--make_story)
   - [2.1 `make_story_gtts.js`](#21-make_story_gttsjs)
   - [2.2 `make_story.js` (OpenAI TTS)](#22-make_storyjs-openai-tts)
3. [Frontend Interface — `public/`](#3-frontend-interface--public)
   - [3.1 `front.js`](#31-frontend-logic--frontjs)
   - [3.2 `index.html`](#32-html-structure--indexhtml)
4. [Supporting Assets](#4-supporting-assets)
   - [4.1 `public/audio`](#41-audio-assets--publicaudio)
   - [4.2 `public/qt`](#42-visual-assets--publicqt)
5. [Folder Overview](#5-folder-overview)

---

## 1. Server Design

### Decision

Custom Node.js server (`server.js`) used instead of frameworks.

### Reasoning

- **Lightweight:** Only static file serving needed.
- **Educational Purpose:** Demonstrates understanding of native HTTP module.
- **Portability:** Simple deployment on free hosts.

### Challenges

- Manual MIME handling for `.opus` and `.mp3`.
- 404 routing for missing files.

### Future Work

Upgrade to **Express.js** for modular routes or API endpoints.

---

## 2. Story Creation Tools — `make_story/`

Automates story generation and metadata creation for the QT Robot.

---

### 2.1 `make_story_gtts.js`

#### Responsibilities

- Parses text and emotion tags.
- Generates French narration using gTTS.
- Merges parts and creates a JSON metadata file.

#### Workflow

1. Input story name.
2. Parse `text.txt`.
3. Generate audio per emotion.
4. Merge and time with FFmpeg.
5. Export final `.mp3` and `.json`.

#### Outputs

| File                       | Description                 |
| -------------------------- | --------------------------- |
| `/audio/audio_story/*.mp3` | Narration and title preview |
| `/stories/*.json`          | Emotion-timestamp metadata  |
| `/stories/index.json`      | Story index                 |

#### Dependencies

Node.js, gTTS, FFmpeg.

---

### 2.2 `make_story.js` (OpenAI TTS)

#### Purpose

Improves emotional tone using OpenAI’s **TTS-1** model.

#### Key Features

- Sequential API calls for stable generation.
- Same file structure as gTTS for compatibility.
- Environment variable `OPENAI_API_KEY` for security.

#### Workflow

1. Read story text.
2. Send requests to OpenAI API.
3. Merge and time segments.
4. Output JSON metadata.

#### Design Notes

Interchangeable with gTTS version — identical schema.

---

## 3. Frontend Interface — `public/`

---

### 3.1 Frontend Logic — `front.js`

Handles user interaction, animation, and audio synchronization.

#### Responsibilities

- Load stories from `/stories/index.json`.
- Generate buttons dynamically.
- Animate QT’s face (blink, mouth, emotion).
- Schedule emotions during playback.

#### Core Components

- `CONFIG` object for all paths and DOM references.
- Emotion + animation loops.
- Async story loading.

#### Key Functions

| Function             | Description                   |
| -------------------- | ----------------------------- |
| `displayEmotion()`   | Shows emotion image.          |
| `startClock()`       | Runs blink/mouth cycles.      |
| `scheduleEmotions()` | Syncs emotions with playback. |
| `downloadStories()`  | Fetches and lists stories.    |
| `selectStory()`      | Loads chosen story.           |

#### Design Notes

Self-contained async IIFE, pure JavaScript, modular story loading.

---

### 3.2 HTML Structure — `index.html`

Defines the layout for QT’s storytelling interface.

#### Elements

| Tag       | ID                   | Role             |
| --------- | -------------------- | ---------------- |
| `<audio>` | `qt_audio`           | Main narration.  |
| `<audio>` | `qt_audio_ask`       | Question cue.    |
| `<table>` | `story_choice_table` | Story list.      |
| `<img>`   | `qt_face`            | Emotion display. |
| `<img>`   | `qt_image`           | Robot base.      |

#### Notes

- Script loaded with `defer` for performance.
- Data loaded dynamically — no hardcoding.
- Optimized for tablets and classrooms.

---

## 4. Supporting Assets

---

### 4.1 Audio Assets — `public/audio`

- **`audio_story/`** — Full story narrations (`.mp3`).
- **Emotion sounds** — `.opus` clips expressing emotions.

---

### 4.2 Visual Assets — `public/qt`

| Category | Examples                     | Purpose        |
| -------- | ---------------------------- | -------------- |
| Emotion  | `joie.png`, `colère.png`     | Emotion faces  |
| Neutral  | `normal2.png`, `normal4.png` | Idle animation |
| Base     | `qt.png`                     | Robot body     |

---

## 5. Folder Overview

| Folder        | Description                    |
| ------------- | ------------------------------ |
| `make_story/` | Story generation scripts       |
| `public/`     | Frontend assets                |
| `docs/`       | Documentation                  |
| Root JS       | Backend + frontend controllers |
