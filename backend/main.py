import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import router as claims_router


app = FastAPI(title="Cecurus Claims Integrity MVP")
frontend_origins = os.getenv(
    "CECURUS_FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in frontend_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(claims_router)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Cecurus Claims Integrity MVP",
        "status": "ok",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
