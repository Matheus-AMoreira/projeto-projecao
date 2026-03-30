from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(..., min_length=2)
    category: str
    expiration_date: Optional[date] = None
    quantity: int = Field(..., ge=0)
    purchase_price: Decimal = Field(..., gt=0)
    purchase_currency: str = Field(default="BRL")
    sale_price: Optional[Decimal] = Field(None, gt=0)
    sale_currency: Optional[str] = "BRL"


class ProductCreate(ProductBase):
    created_at: Optional[datetime] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    sale_price: Optional[Decimal] = Field(None, gt=0)
    expiration_date: Optional[date] = None


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
