from fastapi import APIRouter

from src.api.endpoints import dashboard, predictions, products, upload

router = APIRouter()

router.include_router(products.router, prefix="/items", tags=["Products"])
router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(upload.router, prefix="/upload", tags=["Upload"])
