import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from core.config import settings
from database.mongodb import connect_to_mongo, close_mongo_connection
from api.websockets import router as websocket_router
from api.routes import router as http_router

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to database
    await connect_to_mongo()
    logger.info("Application started up successfully.")
    yield
    # Shutdown: close database connection
    await close_mongo_connection()
    logger.info("Application shut down successfully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Real-time multi-face emotion detection agent using WebSockets and DeepFace.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS config to allow cross-origin requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Change to frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(http_router, prefix="/api/v1")
app.include_router(websocket_router) # WebSockets generally have their own path in router definition

@app.get("/health", tags=["System"])
async def health_check():
    """Returns application health status."""
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error."}
    )
