import base64
import cv2
import numpy as np
from deepface import DeepFace
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

def analyze_frame(base64_img: str) -> List[Dict[str, Any]]:
    """
    Analyze emotions using DeepFace from a base64 encoded image.
    Supports multi-face tracking.
    """
    try:
        if "," in base64_img:
            header, encoded = base64_img.split(",", 1)
        else:
            encoded = base64_img

        img_data = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if img is None:
            logger.warning("Empty or unreadable image frame received.")
            return []

        # Analyze using DeepFace
        analysis = DeepFace.analyze(
            img_path=img,
            actions=['emotion'],
            enforce_detection=False, # Don't throw errors if no face is found
            detector_backend='opencv' # Fastest, good for streaming
        )

        if isinstance(analysis, dict):
            analysis = [analysis]

        results = []
        for i, face_details in enumerate(analysis):
            emotions = face_details.get('emotion', {})
            dominant = face_details.get('dominant_emotion', 'neutral')
            
            # Confidence of the dominant emotion (Deepface returns percentages)
            emotion_score = emotions.get(dominant, 0) / 100.0
            
            # Skip if no face was actually detected with reasonable confidence
            face_confidence = face_details.get('face_confidence', 0)
            if face_confidence < 0.4:
                continue

            # Sometime Deepface returns regions with no real face, let's filter zero region faces
            region = face_details.get('region', {})
            if region.get('w', 0) == 0 or region.get('h', 0) == 0:
                continue

            results.append({
                "face_id": i + 1,
                "dominant_emotion": dominant,
                "confidence": emotion_score,
                "box": {
                    "x": region.get('x', 0),
                    "y": region.get('y', 0),
                    "w": region.get('w', 0),
                    "h": region.get('h', 0)
                }
            })

        return results

    except ValueError as ve:
        # Happens usually if face detection completely fails and enforce_detection is True (handled above)
        logger.warning(f"Face detection failed: {ve}")
        return []
    except Exception as e:
        logger.error(f"Error during DeepFace inference: {e}")
        return []
