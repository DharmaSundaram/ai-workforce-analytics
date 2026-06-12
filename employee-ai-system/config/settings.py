import os
from datetime import timedelta


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Settings:
    """Application settings loaded from environment variables."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "ai-workforce-analytics-secret-2024")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "enterprise-grade-jwt-secret-key")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=int(os.environ.get("JWT_ACCESS_TOKEN_HOURS", "8")))
    CORS_ORIGINS = [
        origin.strip()
        for origin in os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173",
        ).split(",")
        if origin.strip()
    ]
    SQLALCHEMY_TRACK_MODIFICATIONS = False


settings = Settings()
