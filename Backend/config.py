"""
Centralized environment configuration for the Backend.

Loads variables from (in order):
  1. Project root `.env`
  2. `Backend/.env` (optional overrides)
"""
from __future__ import annotations

import os
from pathlib import Path
from urllib.parse import quote_plus

from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parent
ROOT_DIR = BACKEND_DIR.parent

load_dotenv(ROOT_DIR / ".env")
load_dotenv(BACKEND_DIR / ".env", override=True)


def _get(key: str, default: str | None = None) -> str | None:
    value = os.getenv(key)
    if value is None or value.strip() == "":
        return default
    return value.strip()


def _require(key: str) -> str:
    value = _get(key)
    if value is None:
        raise RuntimeError(
            f"Missing required environment variable: {key}. "
            f"Copy .env.example to .env at the project root and fill in values."
        )
    return value


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------
NODE_ENV = _get("NODE_ENV", "development")
APP_ENV = _get("APP_ENV", NODE_ENV)
PORT = int(_get("PORT", _get("BACKEND_PORT", "8000")))
BACKEND_URL = _get("BACKEND_URL", f"http://127.0.0.1:{PORT}")
FRONTEND_URL = _get("FRONTEND_URL", _get("CLIENT_URL", "http://localhost:3000"))
CLIENT_URL = _get("CLIENT_URL", FRONTEND_URL)
API_URL = _get("API_URL", BACKEND_URL)

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
DB_HOST = _get("DB_HOST", "localhost")
DB_PORT = _get("DB_PORT", "5432")
DB_NAME = _get("DB_NAME", "WBP_DB")
DB_USER = _get("DB_USER", "postgres")
DB_PASSWORD = _get("DB_PASSWORD")


def _build_database_url() -> str:
    explicit = _get("DATABASE_URL")
    if explicit:
        return explicit
    if DB_PASSWORD:
        user = quote_plus(DB_USER or "postgres")
        password = quote_plus(DB_PASSWORD)
        return f"postgresql://{user}:{password}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    return "postgresql://postgres:12345@localhost:5432/WBP_DB"


DATABASE_URL = _build_database_url()

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------
_cors_raw = _get("CORS_ORIGINS", FRONTEND_URL or "http://localhost:3000")
CORS_ORIGINS = [origin.strip() for origin in (_cors_raw or "").split(",") if origin.strip()]

# ---------------------------------------------------------------------------
# ML service (Flask)
# ---------------------------------------------------------------------------
ML_SERVICE_URL = _get("ML_SERVICE_URL", "http://127.0.0.1:4050")
ML_PREDICT_ALL_PATH = _get("ML_PREDICT_ALL_PATH", "/predict-all")
ML_REQUEST_TIMEOUT = int(_get("ML_REQUEST_TIMEOUT", "10"))
FLASK_HOST = _get("FLASK_HOST", "0.0.0.0")
FLASK_PORT = int(_get("FLASK_PORT", "4050"))
FLASK_DEBUG = (_get("FLASK_DEBUG", "false") or "false").lower() in ("1", "true", "yes")

# ---------------------------------------------------------------------------
# Auth / session
# ---------------------------------------------------------------------------
SESSION_SECRET = _get("SESSION_SECRET", _get("JWT_SECRET"))
JWT_SECRET = _get("JWT_SECRET", SESSION_SECRET)
JWT_EXPIRES_IN = _get("JWT_EXPIRES_IN", "24h")
REFRESH_TOKEN_SECRET = _get("REFRESH_TOKEN_SECRET")
REFRESH_TOKEN_EXPIRES_IN = _get("REFRESH_TOKEN_EXPIRES_IN", "7d")
SESSION_MINUTES = int(_get("SESSION_MINUTES", "45"))

# ---------------------------------------------------------------------------
# Admin seed (optional script)
# ---------------------------------------------------------------------------
ADMIN_EMAIL = _get("ADMIN_EMAIL")
ADMIN_PASSWORD = _get("ADMIN_PASSWORD")
ADMIN_USERNAME = _get("ADMIN_USERNAME", "admin")
ADMIN_FULLNAME = _get("ADMIN_FULLNAME", "Administrator")
ADMIN_PHONE = _get("ADMIN_PHONE", "")

# ---------------------------------------------------------------------------
# Optional integrations (loaded for future use; not required at runtime)
# ---------------------------------------------------------------------------
SMTP_HOST = _get("SMTP_HOST")
SMTP_PORT = _get("SMTP_PORT", "587")
SMTP_USER = _get("SMTP_USER")
SMTP_PASS = _get("SMTP_PASS")
EMAIL_FROM = _get("EMAIL_FROM")

CLOUDINARY_CLOUD_NAME = _get("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = _get("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = _get("CLOUDINARY_API_SECRET")

AWS_ACCESS_KEY_ID = _get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = _get("AWS_SECRET_ACCESS_KEY")
AWS_REGION = _get("AWS_REGION")
AWS_BUCKET = _get("AWS_BUCKET")

REDIS_URL = _get("REDIS_URL")
