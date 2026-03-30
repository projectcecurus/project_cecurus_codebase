from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _bool_env(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("CECURUS_APP_NAME", "Project Cecurus")
    frontend_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv(
            "CECURUS_FRONTEND_ORIGINS",
            "http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
        ).split(",")
        if origin.strip()
    )
    database_url: str = os.getenv(
        "CECURUS_DATABASE_URL",
        f"sqlite:///{(Path(__file__).resolve().parent / 'cecurus_dev.db').as_posix()}",
    )
    jwt_secret: str = os.getenv("CECURUS_JWT_SECRET", "change-me-for-production")
    jwt_algorithm: str = os.getenv("CECURUS_JWT_ALGORITHM", "HS256")
    access_token_minutes: int = int(os.getenv("CECURUS_ACCESS_TOKEN_MINUTES", "15"))
    refresh_token_minutes: int = int(os.getenv("CECURUS_REFRESH_TOKEN_MINUTES", "480"))
    session_idle_minutes: int = int(os.getenv("CECURUS_SESSION_IDLE_MINUTES", "30"))
    review_session_minutes: int = int(os.getenv("CECURUS_REVIEW_SESSION_MINUTES", "20"))
    max_upload_bytes: int = int(os.getenv("CECURUS_MAX_UPLOAD_BYTES", str(5 * 1024 * 1024)))
    secure_cookies: bool = _bool_env("CECURUS_SECURE_COOKIES", False)
    access_cookie_name: str = os.getenv("CECURUS_ACCESS_COOKIE_NAME", "cecurus_access_token")
    refresh_cookie_name: str = os.getenv("CECURUS_REFRESH_COOKIE_NAME", "cecurus_refresh_token")


settings = Settings()
