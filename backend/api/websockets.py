import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
from services.emotion import analyze_frame
from services.response import generate_emotion_insight
from models.emotion import DetectionResult, EmotionInsight, EmotionLogCreate
from database.mongodb import get_database

router = APIRouter()
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info("Client disconnected")

manager = ConnectionManager()

@router.websocket("/ws/stream")
async def websocket_endpoint(websocket: WebSocket, client_id: str = "anonymous"):
    await manager.connect(websocket)
    db = get_database()
    emotion_logs_collection = db["emotion_logs"]

    try:
        while True:
            # Receive image frame (base64 string) from client
            data = await websocket.receive_text()
            
            payload = json.loads(data)
            base64_img = payload.get("image")
            
            if not base64_img:
                logger.warning("No image data in payload.")
                continue

            # Analyze frame
            faces_detected = analyze_frame(base64_img)
            
            response_results = []
            
            # Process results and create responses
            for face in faces_detected:
                dominant_emotion = face["dominant_emotion"]
                confidence = face["confidence"]
                face_id = face["face_id"]
                box = face.get("box")
                
                insight: EmotionInsight = generate_emotion_insight(dominant_emotion)
                
                result = DetectionResult(
                    face_id=face_id,
                    dominant_emotion=dominant_emotion,
                    confidence=confidence,
                    insight=insight,
                    box=box
                )
                response_results.append(result.model_dump())
                
                # Asynchronously log to the database (only store non-image data for privacy)
                try:
                    log_entry = EmotionLogCreate(
                        user_id=client_id,
                        emotion=dominant_emotion,
                        confidence=confidence,
                        face_id=face_id
                    )
                    await emotion_logs_collection.insert_one(log_entry.model_dump(by_alias=True))
                except Exception as log_error:
                    logger.warning(f"Failed to log emotion to database: {log_error}")

            # Send back the AI response
            output_payload = {
                "faces_detected": len(faces_detected),
                "results": response_results
            }
            await websocket.send_json(output_payload)

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
