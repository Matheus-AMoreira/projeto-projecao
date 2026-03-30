import codecs
import csv

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from src.db.session import get_db
from src.models.product import Product
from src.schemas.product import (
    ProductCreate,
)

router = APIRouter()


@router.post("/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file or not file.filename:
        raise HTTPException(status_code=400, detail="Arquivo não enviado")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um CSV")

    products_to_insert = []
    errors = []

    try:
        csv_reader = csv.DictReader(codecs.iterdecode(file.file, "utf-8"))

        for row in csv_reader:
            clean_row = {k: v.strip() for k, v in row.items() if v and v.strip() != ""}
            try:
                product_validated = ProductCreate(**clean_row)
                products_to_insert.append(product_validated.model_dump())

            except Exception as e:
                errors.append(
                    f"Erro na linha {len(products_to_insert) + len(errors) + 1}: {str(e)}"
                )

        if products_to_insert:
            db.execute(insert(Product), products_to_insert)
            db.commit()

        return {
            "message": f"{len(products_to_insert)} produtos importados.",
            "errors": errors,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar CSV: {str(e)}")
