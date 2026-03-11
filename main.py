from fastapi import FastAPI

from api.routes import router as claims_router


app = FastAPI(title="Cecurus Claims Integrity MVP")
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
