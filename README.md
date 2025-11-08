# QT Robot Storytelling App

An **interactive web application** featuring a LuxAI-inspired QT robot avatar that reads stories to children (ages 3–5).  
Originally built as part of a **university project**, it has been re-implemented and extended for my personal **portfolio**.

---

## Live Demo

[View the deployed app](https://qt-project.onrender.com/)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Installation & Execution](#4-installation--execution)
5. [Documentation](#6-documentation)

---

## 1. Overview

The **QT Robot Storytelling App** uses Node.js and JavaScript to synchronize **voice narration** with **emotion-driven facial animation**.  
Stories are parsed from text files containing `[emotion]` tags, and automatically converted into **audio and emotion metadata**.

It demonstrates:

- Real-time synchronization between visuals and narration,
- Emotion-based storytelling for children,
- Modular, maintainable design suitable for interactive learning experiences.

---

## 2. Features

- **Automated TTS Story Generation** (Google or OpenAI)
- **Emotion Synchronization** — emotions displayed at precise moments during narration
- **Dynamic Story Selection Menu**
- **QT Avatar Animation** (blink, mouth, emotion cycles)
- **Pixel-art background visuals**
- **Lightweight Node.js server** (no frameworks)

---

## 3. Tech Stack

| Layer      | Technology              | Purpose                            |
| ---------- | ----------------------- | ---------------------------------- |
| Frontend   | HTML, CSS, JavaScript   | UI and animation engine            |
| Backend    | Node.js                 | Serves static files and story data |
| Audio      | Google TTS / OpenAI TTS | Speech synthesis                   |
| Media      | FFmpeg                  | Audio merging and timing           |
| Deployment | Render / Railway        | Hosting environment                |

---

## 4. Installation & Execution

1. Clone the repository:

   git clone https://github.com/val-cox/qt-project.git
   cd qt-project

2. Install dependencies:
   npm install

3. Start the development server:
   npm start
4. Open browser:
   http://localhost:3000

## 5. Documentation

Additional documentation files are available in the `/docs` folder:

[ARCHITECTURE.md](./docs/ARCHITECTURE.md)

[PROCESS_DOCUMENTATION.md](./docs/PROCESS_DOCUMENTATION.md)
