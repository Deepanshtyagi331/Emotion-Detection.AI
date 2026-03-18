from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from database.mongodb import get_database
from models.emotion import EmotionLog
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/emotions/history", tags=["Emotions"])
async def get_emotion_history(
    user_id: Optional[str] = None,
    limit: int = Query(100, ge=1, le=1000),
    hours_ago: Optional[int] = None
):
    """
    Retrieve emotional history to generate analytics and trends.
    """
    db = get_database()
    collection = db["emotion_logs"]

    query: Dict[str, Any] = {}
    if user_id:
        query["user_id"] = user_id
        
    if hours_ago:
        time_threshold = datetime.utcnow() - timedelta(hours=hours_ago)
        query["timestamp"] = {"$gte": time_threshold}

    try:
        # Fetch ordered by newest first
        cursor = collection.find(query).sort("timestamp", -1).limit(limit)
        logs = await cursor.to_list(length=limit)

        for log in logs:
            log["_id"] = str(log["_id"])

        return logs
    except Exception as e:
        print(f"Database error in history: {e}")
        return []

@router.get("/emotions/trends", tags=["Analytics"])
async def get_emotion_trends(
    user_id: Optional[str] = None,
    hours_ago: int = Query(24, ge=1)
):
    """
    Aggregate emotional data to find dominant patterns.
    """
    db = get_database()
    collection = db["emotion_logs"]

    match_filter: Dict[str, Any] = {}
    if user_id:
        match_filter["user_id"] = user_id

    time_threshold = datetime.utcnow() - timedelta(hours=hours_ago)
    match_filter["timestamp"] = {"$gte": time_threshold}

    pipeline = [
        {"$match": match_filter},
        {"$group": {
            "_id": "$emotion",
            "count": {"$sum": 1},
            "avg_confidence": {"$avg": "$confidence"}
        }},
        {"$sort": {"count": -1}}
    ]

    try:
        cursor = collection.aggregate(pipeline)
        trends = await cursor.to_list(length=100)
        
        return [
            {
                "emotion": trend["_id"],
                "count": trend["count"],
                "avg_confidence": trend["avg_confidence"]
            } for trend in trends
        ]
    except Exception as e:
        print(f"Database error in trends: {e}")
        return []
