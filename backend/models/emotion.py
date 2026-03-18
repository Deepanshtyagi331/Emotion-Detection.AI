from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class EmotionLogBase(BaseModel):
    user_id: str = "anonymous"
    emotion: str
    confidence: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class EmotionLogCreate(EmotionLogBase):
    face_id: int

class EmotionLog(EmotionLogBase):
    id: str = Field(alias="_id")

class EmotionInsight(BaseModel):
    message: str
    emoji: str
    actionable_advice: Optional[str] = None
    
class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int

class DetectionResult(BaseModel):
    face_id: int
    dominant_emotion: str
    confidence: float
    insight: EmotionInsight
    box: Optional[BoundingBox] = None
    
class FrameAnalysisResult(BaseModel):
    faces_detected: int
    results: List[DetectionResult]
