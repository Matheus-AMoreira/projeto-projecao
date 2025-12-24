from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String

from app.db.session import Base


class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True)
    categoria = Column(String(100), nullable=True)
    name = Column(String(255), nullable=True)
    ano = Column(Integer, nullable=False)
    mes = Column(Integer, nullable=False)
    quantidade = Column(Integer, nullable=False)
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
