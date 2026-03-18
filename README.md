# AI Emotion Detection Agent System

This is a production-ready WebRTC + WebSockets AI System that reads webcam feeds, streams frames at low-latency to a FastAPI backend, detects faces/emotions using DeepFace, logs telemetry to MongoDB, and displays a dynamic Next.js frontend with realtime voice and visual insights.

## Project Structure
```text
ai-emotion-agent/
│
├── frontend/             # Next.js 15, TailwindCSS, Framer Motion, Recharts
├── backend/              # FastAPI, WebSockets, DeepFace tracking, Motor (MongoDB Async)
└── docker-compose.yml    # Quick MongoDB setup
```

## Features Complete:
- **Low-Latency Streaming**: Canvas-based frame extraction directly streaming to Python WebSockets.
- **DeepFace Multi-tracking**: Analyzes bounding boxes, face IDs, and maps bounding coordinates.
- **Visual Feedback**: Next.js realtime bounding box overlays with dynamic emoji interpretation.
- **Voice Feedback API**: Auto-dictates actionable advice to the user via Window.SpeechSynthesis.
- **Telemetry UI Charts**: Reads MongoDB histories to render `recharts` aggregated bar and pie charts.

---

## How to Run the Entire System

### Step 1: Start MongoDB
If you have Docker Desktop installed, spin up MongoDB with:
```bash
cd "ai-emotion-agent"
docker-compose up -d
```
*(Alternatively, you can manually run MongoDB on `mongodb://localhost:27017`)*

### Step 2: Start the Backend (FastAPI + DeepFace)
```bash
cd "ai-emotion-agent/backend"
# 1. Activate Environment (assuming you created 'venv' earlier)
source venv/bin/activate
# 2. Run
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*(Ensure `requirements.txt` was installed. Note: First run of DeepFace might download model weights).*

### Step 3: Start the Frontend (Next.js)
```bash
cd "ai-emotion-agent/frontend"
# 1. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 
Click **"Start Camera"** to initialize feed and begin tracking emotions!

---

### Privacy Features
* Frames (`image/jpeg` base64 chunks) stay locally in RAM and are discarded after `DeepFace.analyze()`.
* Only `{"dominant_emotion": "...", "confidence": 0.xx, "user_id": "..."}` are logged to MongoDB.
