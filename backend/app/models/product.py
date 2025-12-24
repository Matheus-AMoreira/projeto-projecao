from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, Integer, Numeric, String

from app.db.session import Base


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    expiration_date = Column(Date)
    quantity = Column(Integer, nullable=False)
    purchase_price = Column(Numeric(10, 2), nullable=False)
    purchase_currency = Column(String(10), nullable=False)
    sale_price = Column(Numeric(10, 2))
    sale_currency = Column(String(10))
    created_at = Column(
        DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )
