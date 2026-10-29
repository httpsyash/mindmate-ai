# MindMate AI 🧠

AI-powered mental wellness and study companion. Context-aware chat, emotion analysis, voice interaction (STT/TTS), daily mood tracking, AI study planner, personalized recommendations, conversation history, and crisis safety support.

---

## 🚀 Quick Start

Run the entire application (both Backend API and Frontend React Client) with a single command:

```bash
cd ~/Desktop/miniprj
npm start
# or:
node run.js
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Lucide React, Axios
- **Backend:** Node.js 24, Express.js, REST APIs, JWT authentication with bcrypt password hashing
- **Database:** Zero-configuration SQLite engine (`server/data/mindmate.db`) with automatic schema initialization (also supports PostgreSQL via `USE_POSTGRES=true`)
- **AI Model:** Google Gemini (`gemini-3.5-flash`) via `@google/generative-ai`
- **Voice Features:** Native Web Speech API for real-time speech-to-text (voice input) and text-to-speech (voice output)
- **Firebase Auth:** Configured with Firebase Web SDK for Phone OTP verification and account security

---

## 📂 Project Structure

```
~/Desktop/miniprj/
├── run.js               # Concurrently runs backend (5000) & frontend (5173)
├── package.json         # Root scripts (start, dev, client, server, build)
├── apigemini            # Gemini API Key configuration
├── firebase             # Firebase Web credentials
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── components/  # ChatArea, MoodTracker, StudyPlanner, Recommendations, Navbar
│   │   ├── pages/       # Dashboard, Chat, Mood, Planner, Recommendations, Login, Signup
│   │   ├── contexts/    # AuthContext (JWT & user state management)
│   │   ├── services/    # api.js (Axios client with interceptors)
│   │   ├── firebase.js  # Firebase client initialization
│   │   ├── App.jsx      # Routes & ProtectedRoute
│   │   └── main.jsx
│   ├── .env             # Client environment variables
│   └── vite.config.js   # Vite server with /api proxy to localhost:5000
└── server/              # Express backend
    ├── config/          # db.js (SQLite/Postgres adapter), firebase.js
    ├── controllers/     # auth, chat, emotion, mood, planner, recommendation controllers
    ├── middleware/      # JWT auth middleware
    ├── models/          # User, Conversation, Mood, StudyPlan, Recommendation
    ├── services/        # geminiService.js (Gemini 3.5), emotionService, plannerService
    ├── data/            # Local SQLite database (mindmate.db)
    ├── .env             # Server environment variables
    └── app.js           # Express app setup & route mounting
```

---

## ✨ Features

1. **AI Wellness Chat (`/chat`):**
   - Context-aware empathetic conversation powered by Gemini 3.5.
   - Built-in crisis keyword detection with emergency resources and helpline numbers.
   - Voice input (Speech-to-Text) and Voice response (Text-to-Speech) using native Web Speech APIs.

2. **Daily Mood Check-in (`/mood`):**
   - Log daily emotions (Happy, Neutral, Sad, Stressed, Angry) with optional personal reflection notes.
   - Preserved in persistent storage with trend analysis.

3. **AI Study Planner (`/planner`):**
   - Generates daily study blocks and break schedules tailored to your subjects, available hours, and preparation level.
   - Powered by Gemini with offline smart schedule fallback.

4. **Personalized Recommendations (`/recommendations`):**
   - Curated wellness recommendations based on your current state (breaks, breathing exercises, Pomodoro technique, journaling, and productivity).

5. **Authentication (`/login` & `/signup`):**
   - Phone and password authentication with JWT session management.
   - Direct verified onboarding with support for Firebase Phone OTP.
