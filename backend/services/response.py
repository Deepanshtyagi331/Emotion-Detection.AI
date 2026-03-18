from models.emotion import EmotionInsight

EMOTION_MAP = {
    "happy": {
        "text": "You look happy! Keep it up!",
        "emoji": "😄",
        "suggestion": "Share your positive energy with someone today."
    },
    "sad": {
        "text": "You seem down.",
        "emoji": "😢",
        "suggestion": "Maybe take a short break or listen to some uplifting music."
    },
    "angry": {
        "text": "You look upset.",
        "emoji": "😠",
        "suggestion": "Take a deep breath and give yourself a moment to relax."
    },
    "surprise": {
        "text": "Wow, what a surprise!",
        "emoji": "😮",
        "suggestion": "Enjoy the unexpected moment."
    },
    "fear": {
        "text": "You seem anxious or scared.",
        "emoji": "😨",
        "suggestion": "Try taking deep breaths or stepping away for a moment."
    },
    "disgust": {
        "text": "Something bothering you?",
        "emoji": "🤢",
        "suggestion": "Perhaps step away or get some fresh air."
    },
    "neutral": {
        "text": "You're feeling neutral.",
        "emoji": "😐",
        "suggestion": "A good time to focus on your deep work or take a mindful pause."
    }
}

def generate_emotion_insight(emotion: str) -> EmotionInsight:
    emotion_lower = emotion.lower()
    insight_data = EMOTION_MAP.get(
        emotion_lower,
        {
            "text": "Can't determine emotion perfectly.",
            "emoji": "🤔",
            "suggestion": "Stay mindful of how you're feeling."
        }
    )
    return EmotionInsight(
        message=insight_data["text"],
        emoji=insight_data["emoji"],
        actionable_advice=insight_data["suggestion"]
    )
