from typing import Optional

import pandas as pd
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.prediction import Prediction
from app.models.product import Product
from app.services.ml_service import ml_service

router = APIRouter()


@router.post("/update")
def trigger_update(
    category: Optional[str] = Body(None),
    name: Optional[str] = Body(None),
    db: Session = Depends(get_db),
):
    if not category and not name:
        raise HTTPException(status_code=400, detail="Especifique category ou name")

    key_type = "category" if category else "name"
    key_value = category or name

    # Busca dados históricos para alimentar o modelo
    filter_col = Product.category if category else Product.name
    resultados = (
        db.query(
            extract("year", Product.created_at).label("ano"),
            extract("month", Product.created_at).label("mes"),
            func.sum(Product.quantity).label("quantidade"),
        )
        .filter(filter_col == key_value)
        .group_by("ano", "mes")
        .all()
    )

    if not resultados:
        raise HTTPException(status_code=404, detail="Dados históricos insuficientes")

    df = pd.DataFrame([dict(r._mapping) for r in resultados])

    try:
        forecast = ml_service.train_and_predict(db, df, key_type, key_value)
        return {"status": "success", "data": forecast}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
def list_predictions(
    category: Optional[str] = None,
    name: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Prediction)
    if category:
        query = query.filter(Prediction.categoria == category)
    if name:
        query = query.filter(Prediction.name == name)

    return query.order_by(Prediction.ano, Prediction.mes).all()
