from fastapi import APIRouter

from backend.api.auth_routes import router as auth_router
from backend.api.organization_routes import router as organization_router
from backend.api.processing_routes import router as processing_router


router = APIRouter()
router.include_router(auth_router)
router.include_router(organization_router)
router.include_router(processing_router)
