from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from firebase_init import db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Content Hub CMS API")
api_router = APIRouter(prefix="/api")

security = HTTPBearer()

@api_router.get("/")
async def root():
    return {
        "message": "Content Hub CMS API",
        "version": "1.0.0",
        "status": "running"
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "firebase_configured": db is not None
    }

app.include_router(api_router)

# CORS Configuration
origins = os.environ.get('CORS_ORIGINS', '*').split(',')
if origins == ['*']:
    origins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Content Hub CMS API started successfully")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
