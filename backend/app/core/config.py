from dotenv import load_dotenv
import os
from typing import List
from pathlib import Path

# Load environment variables
load_dotenv()

class Settings:
    def __init__(self):
        # Explicitly load .env from the backend directory
        backend_dir = Path(__file__).parent.parent.parent
        load_dotenv(backend_dir / ".env")
        
        # Database URL with fallback
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./messageboard.db")
        self.firebase_cred_path: str = os.getenv("FIREBASE_CRED_PATH", "")
        self.project_name: str = "VIRS-Writing-Challenge"

        # Allow common development origins by default to fix CORS issues
        default_origins = "http://localhost:3000,http://localhost:5173,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5173"
        self.cors_origins: List[str] = [
            origin.strip()
            for origin in os.getenv("CORS_ORIGINS", default_origins).split(",")
        ]

settings = Settings()