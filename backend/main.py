from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database import Base, engine, ensure_sqlite_dev_schema
from backend.api.routes import router as claims_router


app = FastAPI(title="Project Cecurus Zero-Storage API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.frontend_origins),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(claims_router)
Base.metadata.create_all(bind=engine)
ensure_sqlite_dev_schema()


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


@app.exception_handler(Exception)
async def unexpected_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal server error."})


@app.get("/")
def root() -> dict[str, str]:
    return {
        "name": "Project Cecurus Zero-Storage API",
        "status": "ok",
        "health": "/health",
        "docs": "/docs",
    }


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
