from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Emotion Detection Agent"
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "emotion_db"
    
    LATENCY_THRESHOLD_MS: int = 500
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
