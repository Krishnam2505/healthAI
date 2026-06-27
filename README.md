# ⚡ FitAI — AI Health & Fitness Tracker

> Full-stack health tracking app with personalized AI plans powered by Google Gemini

## Features
- 🏋️ Log workouts, meals, sleep & water
- 🤖 AI-generated personalized weekly plans
- 🥗 Real-time AI nutritionist chatbot
- 📊 Progress charts with Chart.js
- 🔥 Workout streak tracking
- 🔐 JWT authentication

## Tech Stack
| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Chart.js, React Router |
| Backend | Node.js, Express, MongoDB, Mongoose |
| AI | Google Gemini 1.5 Flash |
| Auth | JWT + bcrypt |
| Deploy | Render (API) + Vercel (Client) |

## Local Setup
```bash
# Clone the repo
git clone <your-repo-url>

# Setup server
cd server
cp .env.example .env   # fill in your values
npm install
npm run dev

# Setup client (new terminal)
cd client
cp .env.example .env   # fill in your values
npm install
npm run dev
```

## Deployment
- Server → Render (Web Service, Node, start command: node index.js)
- Client → Vercel (auto-detects Vite, set VITE_API_URL env var)
- Database → MongoDB Atlas (free M0 tier)
