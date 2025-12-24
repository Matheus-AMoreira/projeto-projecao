from typing import Optional

from pydantic import BaseModel


class PredictionRequest(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None


class PredictionItem(BaseModel):
    ano: int
    mes: int
    quantidade: int

    class Config:
        from_attributes = True
