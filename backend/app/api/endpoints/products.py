import codecs
import csv
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy import distinct, extract, func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter()

# --- Rotas de Consulta e Histórico ---


@router.get("/", response_model=List[ProductResponse])
def list_all_products(db: Session = Depends(get_db)):
    """Lista todos os produtos individualmente (usado na tela de edição/listagem)."""
    return db.query(Product).all()


@router.get("/stats")
def get_products_stats(
    category: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    """Dados agrupados para o gráfico de histórico (antigo /api/products)."""
    if not category and not name:
        raise HTTPException(status_code=400, detail="Especifique category ou name")

    query_filter = Product.category == category if category else Product.name == name
    resultados = (
        db.query(
            extract("year", Product.created_at).label("ano"),
            extract("month", Product.created_at).label("mes"),
            func.sum(Product.quantity).label("total_quantidade"),
        )
        .filter(query_filter)
        .group_by("ano", "mes")
        .order_by("ano", "mes")
        .all()
    )

    return {
        "key": category or name,
        "dados": [
            {
                "ano": int(r.ano),
                "mes": int(r.mes),
                "quantidade": int(r.total_quantidade),
            }
            for r in resultados
        ],
    }


@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categorias = db.query(distinct(Product.category)).all()
    return {"categorias": [c[0] for c in categorias]}


@router.get("/names")
def get_names(db: Session = Depends(get_db)):
    names = db.query(distinct(Product.name)).all()
    return {"names": [n[0] for n in names]}


@router.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Verifica se a extensão é CSV
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser um CSV")

    products_created = 0
    errors = []

    try:
        # Lê o conteúdo do arquivo
        csv_reader = csv.DictReader(codecs.iterdecode(file.file, "utf-8"))

        for row in csv_reader:
            try:
                # Transforma strings vazias de datas em None
                if not row.get("expiration_date"):
                    row["expiration_date"] = None

                # Validação via Pydantic Schema (Garante a lógica de negócio)
                product_data = ProductCreate(**row)

                # Inserção no banco via SQLAlchemy
                db_product = Product(**product_data.model_dump())
                db.add(db_product)
                products_created += 1

            except Exception as e:
                errors.append(
                    f"Erro na linha {products_created + len(errors) + 1}: {str(e)}"
                )

        db.commit()
        return {
            "message": f"{products_created} produtos importados com sucesso.",
            "errors": errors,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao processar CSV: {str(e)}")


# --- Operações CRUD (Para suportar o Frontend) ---


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    """Cria um novo produto (substitui o POST do Next.js API route)."""
    new_product = Product(**product_in.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Busca um produto pelo ID para edição."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return product


@router.put("/{product_id}")
def update_product(
    product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)
):
    """Atualiza dados de um produto existente."""
    product_query = db.query(Product).filter(Product.id == product_id)
    product = product_query.first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    product_query.update(product_in.dict(exclude_unset=True))
    db.commit()
    return {"message": "Produto atualizado com sucesso"}


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Remove um produto do banco."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    db.delete(product)
    db.commit()
    return None
