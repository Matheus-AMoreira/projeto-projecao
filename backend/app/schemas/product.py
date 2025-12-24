from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    category: str
    expiration_date: Optional[date] = None
    quantity: int
    purchase_price: Decimal
    purchase_currency: str
    sale_price: Optional[Decimal] = None
    sale_currency: Optional[str] = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    sale_price: Optional[Decimal] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
