# ⚡ FitAI — AI-Powered Health & Fitness Tracker

> A modern, full-stack health tracking application that leverages artificial intelligence to provide personalized fitness plans, real-time nutritional advice, and comprehensive cycle tracking.

![FitAI Dashboard Placeholder](https://via.placeholder.com/1000x500?text=FitAI+Dashboard)

## 🌟 Overview

FitAI is not just a standard logging app; it acts as a personal trainer and nutritionist in your pocket. Built with a robust MERN-like stack (MongoDB, Express, React, Node.js) and integrated with **Google's Gemini 2.5 Flash AI**, it analyzes user data to dynamically generate custom workout routines and answer health-related questions in real-time.

### Live Demo
**Try it out:** [https://fit-ai-eight-theta.vercel.app](https://fit-ai-eight-theta.vercel.app)
*(Click **"🕵️‍♂️ Try as Guest"** on the login page for instant access!)*

---

## ✨ Key Features

### 🧠 Artificial Intelligence Integration
- **AI Nutritionist Chatbot**: A contextual chatbot powered by Gemini 2.5 Flash that maintains conversation history and provides tailored dietary advice based on the user's specific health goals (lose, maintain, or gain weight).
- **Personalized Weekly Plans**: Analyzes the user's biometric data, goals, and recent activity logs to instantly generate a 7-day workout and meal schedule.

### 📈 Comprehensive Tracking
- **Multi-Metric Logging**: Track workouts (type, duration, calories), meals, water intake, and sleep duration.
- **Visual Analytics**: Interactive data visualization using `Chart.js` to display weekly trends, macro breakdowns, and calorie goals.
- **Streak Gamification**: Dynamic UI badges that reward users for logging activity on consecutive days to build healthy habits.

### 🌸 Predictive Cycle Tracking
- Exclusively available for female profiles, this feature logs menstrual flow, cramps, and mood.
- Features a mathematically accurate predictive calendar that highlights current flow days and projects future cycles based on historical data.
- Built-in timezone safety and duplicate-entry prevention.

### 🔐 Security & UX
- **Frictionless Guest Login**: Built specifically for portfolio showcases, allowing recruiters to bypass registration with a single click.
- **JWT Authentication**: Secure, persistent sessions utilizing HTTP headers, Bcrypt password hashing, and MongoDB.
- **Responsive Dark/Light Mode**: Fully dynamic CSS architecture adapting to system preferences.

---

## 🛠️ Technology Stack

**Frontend (Client)**
- **React (Vite)**: Fast, modern UI development.
- **React Router Dom**: Client-side routing and protected paths.
- **Chart.js**: Data visualization.
- **Vanilla CSS**: Custom, highly-optimized design system.

**Backend (Server)**
- **Node.js & Express**: RESTful API architecture.
- **MongoDB & Mongoose**: NoSQL database and schema modeling.
- **Google Generative AI SDK**: Direct integration with Gemini 2.5 Flash.
- **Bcrypt.js & JSONWebToken**: Cryptography and secure authentication.

---

## 🚀 Local Setup & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas Account (or local MongoDB)
- Google Gemini API Key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/fit-ai.git
cd fit-ai
```

### 2. Backend Setup
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory:
```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key_minimum_32_chars
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=http://localhost:5173
```
Start the server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the client folder:
```bash
cd client
npm install
```
Create a `.env` file in the `client` directory:
```env
VITE_API_URL=http://localhost:5001/api
```
Start the frontend:
```bash
npm run dev
```

---

## 🌐 Deployment Architecture

- **Frontend Deployment**: Deployed on **Vercel**. Vercel automatically detects the Vite build process. Environment variables (`VITE_API_URL`) are baked in at build time.
- **Backend Deployment**: Deployed on **Render** as a Web Service. Configured with strict CORS policies that only accept requests from the production Vercel domain.
- **Database**: Hosted on **MongoDB Atlas** (M0 Free Cluster).

---

## 📝 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Create a new user account | No |
| `POST` | `/api/auth/login` | Authenticate user and return JWT | No |
| `GET`  | `/api/dashboard` | Fetch aggregated user stats & streaks | Yes |
| `POST` | `/api/workout` | Log a new workout session | Yes |
| `POST` | `/api/cycle` | Log menstrual symptoms | Yes |
| `GET`  | `/api/ai/plan` | Generate a personalized weekly plan | Yes |
| `POST` | `/api/ai/chat` | Send a message to the AI nutritionist | Yes |

---

*Designed and developed as a portfolio project demonstrating full-stack proficiency, modern UI/UX principles, and AI integration.*
