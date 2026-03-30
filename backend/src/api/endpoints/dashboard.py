from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.models.product import Product

router = APIRouter()


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    today = date.today()
    next_month = today + timedelta(days=30)

    # 1. Validade
    vencidos = db.query(Product).filter(Product.expiration_date < today).count()
    vencendo_em_breve = (
        db.query(Product)
        .filter(Product.expiration_date >= today, Product.expiration_date <= next_month)
        .count()
    )

    # 2. Top Categoria (Mais vendida/movimentada)
    top_category = (
        db.query(Product.category, func.sum(Product.quantity).label("total"))
        .group_by(Product.category)
        .order_by(desc(func.sum(Product.quantity)))
        .first()
    )

    # 3. Top Produto
    top_product = (
        db.query(Product.name, func.sum(Product.quantity).label("total"))
        .group_by(Product.name)
        .order_by(desc(func.sum(Product.quantity)))
        .first()
    )

    return {
        "metrics": {
            "expired": vencidos,
            "expiring_soon": vencendo_em_breve,
            "top_category": top_category[0] if top_category else "N/A",
            "top_product": top_product[0] if top_product else "N/A",
        }
    }
