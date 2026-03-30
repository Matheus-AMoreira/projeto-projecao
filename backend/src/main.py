from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.router import router
from src.db.session import Base, engine

app = FastAPI(title="Sistema de Projeção de Items em Estoque")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["POST, DELETE, PATCH, PUT, OPTIONS"],
    allow_credentials=True,
    allow_headers=["AUTHORIZATION"],
)

Base.metadata.create_all(bind=engine)

app.include_router(router, prefix="/api")
