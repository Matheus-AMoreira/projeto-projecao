from fastapi import APIRouter

from app.api.endpoints import predictions, products

api_router = APIRouter()

# Rotas de produtos e categorias
api_router.include_router(products.router, prefix="/items", tags=["Products"])

# Rotas de machine learning e consultas de predição
api_router.include_router(
    predictions.router, prefix="/predictions", tags=["Predictions"]
)
