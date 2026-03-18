# AI Emotion Detection Agent - Backend

This is the FastAPI-based backend for the AI Emotion Detection system. It handles real-time WebSocket communication for video frame processing using DeepFace and provides REST API endpoints for tracking emotional trends via MongoDB.

## Features
- **Real-Time Analysis**: Low-latency emotion detection (via DeepFace + OpenCV).
- **WebSocket Streaming**: Bidirectional communication for streaming base64 images and returning AI insights.
- **Privacy-First Design**: Only telemetry, metadata, and labels are stored—no images are saved!
- **Historical Emotion Logs**: Aggregate and search emotional history with native MongoDB pipelines.

## Setup Instructions

### 1. Prerequisites
- Python 3.9+
- MongoDB Installed & Running (default: `localhost:27017`)
- (Optional but Recommended) Conda or venv for environment isolation.

### 2. Environment Setup

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:
**Note:** DeepFace will download model weights on the first run. Ensure you have internet access.

```bash
pip install -r requirements.txt
```

### 3. Run the Server

Start the FastAPI application with Uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Open `http://localhost:8000/docs` to see the localized Swagger API documentation.

## WebSocket API Guide
Connect to `ws://localhost:8000/ws/stream?client_id=my_user_id`

Send JSON format payload:
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

Receive JSON response:
```json
{
  "faces_detected": 1,
  "results": [
    {
      "face_id": 1,
      "dominant_emotion": "happy",
      "confidence": 0.98,
      "insight": {
        "message": "You look happy! Keep it up!",
        "emoji": "😄",
        "actionable_advice": "Share your positive energy with someone today."
      }
    }
  ]
}
```
