# QT Robot Storytelling App  

An interactive web application featuring the [LuxAI QT robot](https://luxai.com/) avatar designed to read stories to children (ages 3–5).  
This project was originally built as part of a class project and has been re-implemented and extended for my personal portfolio.

---

## 🌐 Live Demo  
You can view the deployed version here:  
[https://qt-project.onrender.com/](https://qt-project.onrender.com/)

---

## 🚀 Features  
- QT robot avatar with animated facial expressions (blinking, mouth movement, emotions).  
- Storytelling mode: the robot reads pre-recorded children’s stories with synchronized emotions.  
- Audio playback with emotion cues (e.g., joy, fear, sadness).  
- Interactive story selection menu.  
- Pixel-art inspired background visuals.  

---

## 🛠️ Tech Stack  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Node.js (custom static file server)  
- **Deployment:** Render / Railway  
- **Assets:** Audio files (stories + emotion cues), face images, pixel-art background  

---

## 📂 Project Structure  
qt-project/
├── make_story/ # Story generation utility
├── public/ # Frontend assets
│ ├── audio/ # Audio files (stories + emotions)
│ ├── images/ # Backgrounds, robot face sprites
│ ├── scripts/ # Client-side JS
│ └── styles/ # CSS
├── stories/ # JSON files describing stories and emotion timings
├── server.js # Node.js server
├── package.json # Node.js project config
└── README.md # Project documentation


---

## ⚙️ Running Locally  
1. Clone the repository:  

   git clone https://github.com/val-cox/qt-project.git
   cd qt-project

2. Install dependencies:
     npm install

3. Start the development server:
    npm start
4. Open browser:
    http://localhost:3000
    